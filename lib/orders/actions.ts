"use server";

import crypto from "node:crypto";
import { after } from "next/server";

import { supabaseServer } from "@/lib/supabase/server";
import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { requireStaffSession, sendStaffPasswordSetupLink, staffSignIn, staffSignOut } from "@/lib/auth/staff";
import { createCustomerSession, lastFourMatches, requireCustomerSession } from "@/lib/auth/customer";
import { isGatePhase, nextPhase, prevNonGatePhase } from "@/lib/orders/phases";
import { setOpsLocaleCookie, type OpsLocale } from "@/lib/ops-locale";
import { trackingUrl } from "@/lib/orders/tracking";
import { notifyQuoteReceived, notifyGateReady, notifyDelivered, notifyStaffGateResponse } from "@/lib/email/notify";
import { isQuantityRange } from "@/lib/orders/quantity";
import { QUOTE_HONEYPOT_FIELD } from "@/lib/orders/quote";
import type { Order, OrderEvent, SampleImage, ArtworkFile } from "@/lib/orders/types";

const FAILED_ATTEMPT_LIMIT = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

const ARTWORK_BUCKET = "artwork-files";

function randomSlugSuffix(): string {
  return crypto.randomBytes(8).toString("base64url");
}

// ---------------------------------------------------------------------------
// Quote form -> order creation
// ---------------------------------------------------------------------------

const CUSTOMER_ARTWORK_MAX_BYTES = 10 * 1024 * 1024; // matches the "artwork-files" bucket's own cap
const CUSTOMER_ARTWORK_MAX_FILES = 3;
const CUSTOMER_ARTWORK_EXT_RE = /\.(pdf|ai|eps|svg|png|jpe?g|webp|zip)$/i;

const QUOTE_DEDUPE_WINDOW_MS = 30 * 60 * 1000;

// Customer design files upload straight from the browser to Storage via
// signed URLs, never through our function: Vercel caps a function's request
// body at 4.5MB regardless of Next's serverActions.bodySizeLimit, so sending
// the files inside createOrderFromQuote's FormData failed with 413
// FUNCTION_PAYLOAD_TOO_LARGE for anything but small attachments.
const CUSTOMER_ARTWORK_PREFIX = "customer/pending";
const CUSTOMER_ARTWORK_PATH_RE = /^customer\/pending\/[A-Za-z0-9_-]{16}\/[0-2]\.(pdf|ai|eps|svg|png|jpe?g|webp|zip)$/;

export type CustomerArtworkUpload = { path: string; signedUrl: string };

/**
 * Step 1 of the quote form's attachment flow: returns one signed upload URL
 * per file the customer picked. The browser PUTs each file to its URL, then
 * passes the resulting paths to createOrderFromQuote.
 */
export async function createCustomerArtworkUploadUrls(
  files: { name: string; size: number }[]
): Promise<CustomerArtworkUpload[] | null> {
  if (!Array.isArray(files) || files.length === 0 || files.length > CUSTOMER_ARTWORK_MAX_FILES) return null;
  for (const f of files) {
    if (typeof f?.name !== "string" || typeof f?.size !== "number") return null;
    if (f.size <= 0 || f.size > CUSTOMER_ARTWORK_MAX_BYTES || !CUSTOMER_ARTWORK_EXT_RE.test(f.name)) return null;
  }

  const db = supabaseServer();
  const folder = `${CUSTOMER_ARTWORK_PREFIX}/${crypto.randomBytes(12).toString("base64url")}`;
  const uploads: CustomerArtworkUpload[] = [];

  for (let i = 0; i < files.length; i++) {
    const ext = files[i].name.split(".").pop()!.toLowerCase();
    const path = `${folder}/${i}.${ext}`;
    const { data, error } = await db.storage.from(ARTWORK_BUCKET).createSignedUploadUrl(path);
    if (error || !data) {
      console.error("createCustomerArtworkUploadUrls failed", error);
      return null;
    }
    uploads.push({ path, signedUrl: data.signedUrl });
  }

  return uploads;
}

/**
 * Step 2: turns the "artwork" entries the form sends back (JSON
 * { path, label }) into ArtworkFile records, keeping only paths this server
 * could have issued and that actually finished uploading.
 */
async function resolveCustomerArtwork(entries: FormDataEntryValue[]): Promise<ArtworkFile[]> {
  const db = supabaseServer();
  const resolved: ArtworkFile[] = [];

  for (const entry of entries.slice(0, CUSTOMER_ARTWORK_MAX_FILES)) {
    if (typeof entry !== "string") continue;
    let parsed: { path?: unknown; label?: unknown };
    try {
      parsed = JSON.parse(entry);
    } catch {
      continue;
    }
    const { path, label } = parsed;
    if (typeof path !== "string" || !CUSTOMER_ARTWORK_PATH_RE.test(path)) continue;

    try {
      const { data: exists } = await db.storage.from(ARTWORK_BUCKET).exists(path);
      if (!exists) continue;
    } catch (err) {
      console.error("resolveCustomerArtwork: exists check threw", err);
      continue;
    }

    const { data: pub } = db.storage.from(ARTWORK_BUCKET).getPublicUrl(path);
    const name = typeof label === "string" && label.trim() ? label.trim().slice(0, 200) : path.split("/").pop()!;
    resolved.push({ url: pub.publicUrl, label: name });
  }

  return resolved;
}

export async function createOrderFromQuote(
  formData: FormData,
  locale: string
): Promise<{ orderNumber: string; trackingPath: string; trackingUrl: string } | null> {
  const get = (k: string) => (formData.get(k) as string | null)?.trim() ?? "";

  const name = get("name");
  const phone = get("phone");
  const email = get("email");
  const qty = get("qty");
  if (!name || !phone || !email || !isQuantityRange(qty)) return null;

  // Honeypot: the field is hidden off-screen in the form, so only bots that
  // blindly fill every input ever send a value for it.
  if (get(QUOTE_HONEYPOT_FIELD)) return null;

  const company = get("company") || null;
  const product = get("product") || "Not specified";
  const message = get("message") || null;
  const source = get("source") || "quote_form";

  const db = supabaseServer();

  // Re-submitting the exact same request within the window (double click,
  // "did it send?" retry, bot replay) returns the order that already exists
  // instead of creating a duplicate in the ops dashboard.
  const since = new Date(Date.now() - QUOTE_DEDUPE_WINDOW_MS).toISOString();
  const { data: recent } = await db
    .from("orders")
    .select("order_number, tracking_slug, customer_name, customer_email, customer_company, product_label, quantity, notes, source")
    .eq("customer_phone", phone)
    .gte("created_at", since)
    .order("created_at", { ascending: false });
  const existing = recent?.find(
    (o) =>
      o.customer_name === name &&
      o.customer_email === email &&
      o.customer_company === company &&
      o.product_label === product &&
      o.quantity === qty &&
      o.notes === message &&
      o.source === source
  );
  if (existing) {
    return {
      orderNumber: existing.order_number,
      trackingPath: `${locale === "ar" ? "/ar" : ""}/track/${existing.tracking_slug}`,
      trackingUrl: trackingUrl(existing.tracking_slug, locale),
    };
  }

  const slug = randomSlugSuffix();

  const { data, error } = await db
    .from("orders")
    .insert({
      tracking_slug: slug,
      customer_name: name,
      customer_phone: phone,
      customer_email: email,
      customer_company: company,
      product_label: product,
      quantity: qty,
      notes: message,
      source,
      locale: locale === "ar" ? "ar" : "en",
    })
    .select("*")
    .single();

  if (error || !data) {
    console.error("createOrderFromQuote failed", error);
    return null;
  }

  const customerArtworkFiles = await resolveCustomerArtwork(formData.getAll("artwork"));
  if (customerArtworkFiles.length > 0) {
    await db.from("orders").update({ customer_artwork_files: customerArtworkFiles }).eq("id", data.id);
  }

  await db.from("order_events").insert({
    order_id: data.id,
    type: "created",
    phase: "order_confirmed",
    actor: "system",
    message: customerArtworkFiles.length > 0 ? `Customer attached ${customerArtworkFiles.length} design file(s).` : null,
  });

  // Sent after the response so the customer sees the confirmation right away
  // instead of waiting on two sequential Resend calls — a slow reply is what
  // made people click "Send" again.
  after(() => notifyQuoteReceived({ ...(data as Order), customer_artwork_files: customerArtworkFiles }));

  return {
    orderNumber: data.order_number,
    trackingPath: `${locale === "ar" ? "/ar" : ""}/track/${data.tracking_slug}`,
    trackingUrl: trackingUrl(data.tracking_slug, locale),
  };
}

// ---------------------------------------------------------------------------
// Staff auth
// ---------------------------------------------------------------------------

export async function staffLogin(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  return staffSignIn(email, password);
}

export async function staffLogout(): Promise<void> {
  await staffSignOut();
}

export async function staffRequestPasswordReset(email: string): Promise<void> {
  await sendStaffPasswordSetupLink(email);
}

export async function staffSetNewPassword(tokenHash: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createAuthServerClient();
  const { error: verifyError } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
  if (verifyError) return { ok: false, error: "This reset link is invalid or has expired." };

  const { error: updateError } = await supabase.auth.updateUser({ password });
  if (updateError) return { ok: false, error: updateError.message };

  return { ok: true };
}

export async function setOpsLocale(locale: OpsLocale): Promise<void> {
  await requireStaffSession();
  await setOpsLocaleCookie(locale);
}

// ---------------------------------------------------------------------------
// Staff order management
// ---------------------------------------------------------------------------

export async function getOrderEvents(orderId: string): Promise<OrderEvent[]> {
  await requireStaffSession();
  const db = supabaseServer();

  const { data, error } = await db
    .from("order_events")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  return error ? [] : ((data ?? []) as OrderEvent[]);
}

export async function advancePhase(orderId: string): Promise<{ ok: boolean; error?: string }> {
  const staff = await requireStaffSession();
  const db = supabaseServer();

  const { data: order, error: fetchError } = await db
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();
  if (fetchError || !order) return { ok: false, error: "Order not found." };
  if (isGatePhase(order.phase)) {
    return { ok: false, error: "Order is waiting on customer approval." };
  }
  if (
    order.phase === "quote_pending" &&
    (order.unit_price == null || !order.invoice_file || order.confirmed_quantity == null)
  ) {
    return { ok: false, error: "Set a price, confirm the exact quantity, and upload the invoice before sending the quote for approval." };
  }

  const next = nextPhase(order.phase);
  if (!next) return { ok: false, error: "Order is already delivered." };

  const update: Partial<Order> = { phase: next, updated_at: new Date().toISOString() };
  if (next === "delivered") update.delivered_at = new Date().toISOString();

  const { error: updateError } = await db.from("orders").update(update).eq("id", orderId);
  if (updateError) return { ok: false, error: updateError.message };

  await db
    .from("order_events")
    .insert({ order_id: orderId, type: "phase_change", phase: next, actor: "staff", actor_name: staff.name });

  if (next === "quote_review" || next === "artwork_approved" || next === "sample_approved") {
    await notifyGateReady({ ...(order as Order), phase: next }, next);
  }
  if (next === "delivered") {
    await notifyDelivered({ ...(order as Order), phase: next });
  }

  return { ok: true };
}

const SAMPLE_BUCKET = "sample-photos";
// Samples can be a photo or a short video clip — the bucket's own file-size
// limit in the Supabase dashboard must be raised to match (see supabase/*.sql).
const SAMPLE_MAX_BYTES = 25 * 1024 * 1024;
const SAMPLE_MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
};

const INVOICE_MAX_BYTES = 10 * 1024 * 1024; // matches the "artwork-files" bucket's own cap

// Artwork proofs stay image-only, at the original size cap.
const ARTWORK_MAX_BYTES = 5 * 1024 * 1024;
const ARTWORK_MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// ---------------------------------------------------------------------------
// Staff file uploads: the browser PUTs the file to a signed URL from
// createStaffUploadUrl, then calls the matching save* action with the path.
// Vercel caps function request bodies at 4.5MB, so files must not pass
// through a Server Action themselves.
// ---------------------------------------------------------------------------

type StaffUploadKind = "sample" | "artwork" | "invoice";

const STAFF_UPLOADS: Record<
  StaffUploadKind,
  { bucket: string; maxBytes: number; mimeExt: Record<string, string>; typeError: string; sizeError: string }
> = {
  sample: {
    bucket: SAMPLE_BUCKET,
    maxBytes: SAMPLE_MAX_BYTES,
    mimeExt: SAMPLE_MIME_EXT,
    typeError: "Unsupported file type — use JPEG, PNG, WebP, MP4, MOV or WebM.",
    sizeError: "File too large — 25MB max.",
  },
  artwork: {
    bucket: ARTWORK_BUCKET,
    maxBytes: ARTWORK_MAX_BYTES,
    mimeExt: ARTWORK_MIME_EXT,
    typeError: "Unsupported file type — use JPEG, PNG or WebP.",
    sizeError: "File too large — 5MB max.",
  },
  invoice: {
    bucket: ARTWORK_BUCKET,
    maxBytes: INVOICE_MAX_BYTES,
    mimeExt: { "application/pdf": "pdf" },
    typeError: "Unsupported file type — use PDF.",
    sizeError: "File too large — 10MB max.",
  },
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STAFF_UPLOAD_SLOTS = 3;

function staffUploadPrefix(kind: StaffUploadKind, orderId: string, slot: number): string {
  return kind === "invoice" ? `invoices/${orderId}/` : `${orderId}/${slot}-`;
}

function isValidSlot(kind: StaffUploadKind, slot: number): boolean {
  return kind === "invoice" || (Number.isInteger(slot) && slot >= 0 && slot < STAFF_UPLOAD_SLOTS);
}

/** Step 1 of a staff upload: validates the file's metadata and returns a signed upload URL for it. */
export async function createStaffUploadUrl(
  kind: StaffUploadKind,
  orderId: string,
  slot: number,
  file: { size: number; type: string }
): Promise<{ ok: boolean; path?: string; signedUrl?: string; error?: string }> {
  await requireStaffSession();

  const cfg = STAFF_UPLOADS[kind];
  if (!cfg || !UUID_RE.test(orderId) || !isValidSlot(kind, slot)) return { ok: false, error: "Invalid upload." };
  const ext = cfg.mimeExt[file?.type];
  if (!ext) return { ok: false, error: cfg.typeError };
  if (typeof file.size !== "number" || file.size <= 0) return { ok: false, error: "No file provided." };
  if (file.size > cfg.maxBytes) return { ok: false, error: cfg.sizeError };

  const path = `${staffUploadPrefix(kind, orderId, slot)}${Date.now()}.${ext}`;
  const { data, error } = await supabaseServer().storage.from(cfg.bucket).createSignedUploadUrl(path);
  if (error || !data) {
    console.error("createStaffUploadUrl failed", error);
    return { ok: false, error: error?.message ?? "Upload failed." };
  }
  return { ok: true, path, signedUrl: data.signedUrl };
}

/**
 * Step 2 guard: only accepts a path createStaffUploadUrl could have issued
 * for this order/slot, and only once the file is actually in Storage.
 * Returns the file's public URL.
 */
async function verifyStaffUpload(
  kind: StaffUploadKind,
  orderId: string,
  slot: number,
  path: string
): Promise<string | null> {
  const cfg = STAFF_UPLOADS[kind];
  if (!UUID_RE.test(orderId) || !isValidSlot(kind, slot) || typeof path !== "string") return null;
  const prefix = staffUploadPrefix(kind, orderId, slot);
  const rest = path.startsWith(prefix) ? path.slice(prefix.length) : "";
  const exts = new Set(Object.values(cfg.mimeExt));
  const m = /^\d+\.([a-z0-9]+)$/.exec(rest);
  if (!m || !exts.has(m[1])) return null;

  const db = supabaseServer();
  try {
    const { data: exists } = await db.storage.from(cfg.bucket).exists(path);
    if (!exists) return null;
  } catch (err) {
    console.error("verifyStaffUpload: exists check threw", err);
    return null;
  }
  return db.storage.from(cfg.bucket).getPublicUrl(path).data.publicUrl;
}

export async function saveSampleImage(
  orderId: string,
  slot: number,
  path: string
): Promise<{ ok: boolean; url?: string; error?: string }> {
  await requireStaffSession();

  const publicUrl = await verifyStaffUpload("sample", orderId, slot, path);
  if (!publicUrl) return { ok: false, error: "Upload not found — try again." };

  const db = supabaseServer();
  const { data: order, error: fetchError } = await db
    .from("orders")
    .select("sample_images")
    .eq("id", orderId)
    .single();
  if (fetchError || !order) return { ok: false, error: "Order not found." };

  const images: SampleImage[] = [...((order.sample_images ?? []) as SampleImage[])];
  while (images.length <= slot) images.push({ url: "" });
  images[slot] = { url: publicUrl };

  const { error: updateError } = await db
    .from("orders")
    .update({ sample_images: images, updated_at: new Date().toISOString() })
    .eq("id", orderId);
  if (updateError) return { ok: false, error: updateError.message };

  return { ok: true, url: publicUrl };
}

export async function removeSampleImage(orderId: string, slot: number): Promise<{ ok: boolean; error?: string }> {
  await requireStaffSession();
  const db = supabaseServer();

  const { data: order, error: fetchError } = await db
    .from("orders")
    .select("sample_images")
    .eq("id", orderId)
    .single();
  if (fetchError || !order) return { ok: false, error: "Order not found." };

  const images: SampleImage[] = [...((order.sample_images ?? []) as SampleImage[])];
  if (images[slot]) images[slot] = { url: "" };

  const { error: updateError } = await db
    .from("orders")
    .update({ sample_images: images, updated_at: new Date().toISOString() })
    .eq("id", orderId);
  if (updateError) return { ok: false, error: updateError.message };

  return { ok: true };
}

export async function saveArtworkFile(
  orderId: string,
  slot: number,
  path: string
): Promise<{ ok: boolean; url?: string; error?: string }> {
  await requireStaffSession();

  const publicUrl = await verifyStaffUpload("artwork", orderId, slot, path);
  if (!publicUrl) return { ok: false, error: "Upload not found — try again." };

  const db = supabaseServer();
  const { data: order, error: fetchError } = await db
    .from("orders")
    .select("artwork_files")
    .eq("id", orderId)
    .single();
  if (fetchError || !order) return { ok: false, error: "Order not found." };

  const files: ArtworkFile[] = [...((order.artwork_files ?? []) as ArtworkFile[])];
  while (files.length <= slot) files.push({ url: "" });
  files[slot] = { url: publicUrl };

  const { error: updateError } = await db
    .from("orders")
    .update({ artwork_files: files, updated_at: new Date().toISOString() })
    .eq("id", orderId);
  if (updateError) return { ok: false, error: updateError.message };

  return { ok: true, url: publicUrl };
}

export async function removeArtworkFile(orderId: string, slot: number): Promise<{ ok: boolean; error?: string }> {
  await requireStaffSession();
  const db = supabaseServer();

  const { data: order, error: fetchError } = await db
    .from("orders")
    .select("artwork_files")
    .eq("id", orderId)
    .single();
  if (fetchError || !order) return { ok: false, error: "Order not found." };

  const files: ArtworkFile[] = [...((order.artwork_files ?? []) as ArtworkFile[])];
  if (files[slot]) files[slot] = { url: "" };

  const { error: updateError } = await db
    .from("orders")
    .update({ artwork_files: files, updated_at: new Date().toISOString() })
    .eq("id", orderId);
  if (updateError) return { ok: false, error: updateError.message };

  return { ok: true };
}

export async function saveCustomInvoice(
  orderId: string,
  path: string,
  label: string
): Promise<{ ok: boolean; url?: string; error?: string }> {
  await requireStaffSession();

  const publicUrl = await verifyStaffUpload("invoice", orderId, 0, path);
  if (!publicUrl) return { ok: false, error: "Upload not found — try again." };

  const invoiceFile: ArtworkFile = { url: publicUrl, label: String(label ?? "").slice(0, 200) || "invoice.pdf" };

  const { error: updateError } = await supabaseServer()
    .from("orders")
    .update({ invoice_file: invoiceFile, updated_at: new Date().toISOString() })
    .eq("id", orderId);
  if (updateError) return { ok: false, error: updateError.message };

  return { ok: true, url: publicUrl };
}

export async function removeCustomInvoice(orderId: string): Promise<{ ok: boolean; error?: string }> {
  await requireStaffSession();
  const db = supabaseServer();

  const { error } = await db
    .from("orders")
    .update({ invoice_file: null, updated_at: new Date().toISOString() })
    .eq("id", orderId);
  if (error) return { ok: false, error: error.message };

  return { ok: true };
}

export async function updateOrderFields(
  orderId: string,
  fields: Partial<
    Pick<
      Order,
      | "unit_price"
      | "order_total"
      | "lead_time_days"
      | "estimated_delivery"
      | "confirmed_quantity"
      | "product_label"
    >
  >
): Promise<{ ok: boolean; error?: string }> {
  await requireStaffSession();
  const db = supabaseServer();

  const { error } = await db
    .from("orders")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function sendReminder(orderId: string): Promise<{ ok: boolean; message?: string; error?: string }> {
  const staff = await requireStaffSession();
  const db = supabaseServer();

  const { data: order, error } = await db
    .from("orders")
    .select("order_number, product_label, phase")
    .eq("id", orderId)
    .single();
  if (error || !order) return { ok: false, error: "Order not found." };

  await db
    .from("order_events")
    .insert({ order_id: orderId, type: "reminder_sent", actor: "staff", actor_name: staff.name });

  return {
    ok: true,
    message: `Hi! Order ${order.order_number} (${order.product_label}) is waiting on your approval — could you take a look when you get a chance?`,
  };
}

/** Recovers a storage object's path from the public URL Supabase handed back for it. */
function storagePathFromPublicUrl(url: string, bucket: string): string | null {
  const marker = `/object/public/${bucket}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : url.slice(i + marker.length);
}

/**
 * Best-effort cleanup of the order's storage objects before the row itself is
 * deleted. A failed remove here is logged and swallowed — it must never block
 * the delete the staff member asked for.
 */
async function removeOrderStorageFiles(order: Order): Promise<void> {
  const db = supabaseServer();

  const artworkPaths = [
    ...order.artwork_files,
    ...order.customer_artwork_files,
    ...(order.invoice_file ? [order.invoice_file] : []),
  ]
    .map((f) => storagePathFromPublicUrl(f.url, ARTWORK_BUCKET))
    .filter((p): p is string => !!p);

  const samplePaths = order.sample_images
    .map((f) => storagePathFromPublicUrl(f.url, SAMPLE_BUCKET))
    .filter((p): p is string => !!p);

  try {
    if (artworkPaths.length > 0) await db.storage.from(ARTWORK_BUCKET).remove(artworkPaths);
    if (samplePaths.length > 0) await db.storage.from(SAMPLE_BUCKET).remove(samplePaths);
  } catch (err) {
    console.error("removeOrderStorageFiles: storage remove threw", order.id, err);
  }
}

export async function deleteOrder(orderId: string): Promise<{ ok: boolean; error?: string }> {
  await requireStaffSession();
  const db = supabaseServer();

  const { data: order, error: fetchError } = await db
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();
  if (fetchError || !order) return { ok: false, error: "Order not found." };

  await removeOrderStorageFiles(order as Order);

  // order_events rows cascade-delete with the order (see supabase/order_tracking.sql).
  const { error: deleteError } = await db.from("orders").delete().eq("id", orderId);
  if (deleteError) return { ok: false, error: deleteError.message };

  return { ok: true };
}

// ---------------------------------------------------------------------------
// Customer verification + gate actions
// ---------------------------------------------------------------------------

export async function verifyCustomerPhone(
  slug: string,
  last4: string
): Promise<{ ok: boolean; reason?: "not_found" | "locked" | "mismatch" }> {
  const db = supabaseServer();
  const { data: order, error } = await db
    .from("orders")
    .select("id, customer_phone, failed_verify_attempts, verify_locked_until")
    .eq("tracking_slug", slug)
    .single();
  if (error || !order) return { ok: false, reason: "not_found" };

  if (order.verify_locked_until && new Date(order.verify_locked_until) > new Date()) {
    return { ok: false, reason: "locked" };
  }

  if (lastFourMatches(order.customer_phone, last4)) {
    await db.from("orders").update({ failed_verify_attempts: 0, verify_locked_until: null }).eq("id", order.id);
    await createCustomerSession(slug);
    return { ok: true };
  }

  const attempts = order.failed_verify_attempts + 1;
  const locked = attempts >= FAILED_ATTEMPT_LIMIT;
  await db
    .from("orders")
    .update({
      failed_verify_attempts: attempts,
      verify_locked_until: locked ? new Date(Date.now() + LOCKOUT_MS).toISOString() : null,
    })
    .eq("id", order.id);

  return { ok: false, reason: locked ? "locked" : "mismatch" };
}

export async function approveGate(
  slug: string
): Promise<{ ok: boolean; order?: Order; events?: OrderEvent[]; error?: string }> {
  await requireCustomerSession(slug);
  const db = supabaseServer();

  const { data: order, error } = await db
    .from("orders")
    .select("id, phase, order_number, customer_name")
    .eq("tracking_slug", slug)
    .single();
  if (error || !order) return { ok: false, error: "Order not found." };
  if (!isGatePhase(order.phase)) return { ok: false, error: "Nothing to approve." };

  const next = nextPhase(order.phase);
  if (!next) return { ok: false, error: "Order has no next phase." };

  const update: Partial<Order> = { phase: next, updated_at: new Date().toISOString() };
  // Quoted lead time is measured from the moment the customer signs off on
  // the sample, not from order creation — this is the one and only place
  // that transition happens.
  if (order.phase === "sample_approved") update.lead_time_started_at = new Date().toISOString();

  const { data: updated, error: updateError } = await db
    .from("orders")
    .update(update)
    .eq("id", order.id)
    .select("*")
    .single();
  if (updateError || !updated) return { ok: false, error: updateError?.message ?? "Update failed." };

  const { data: events } = await db
    .from("order_events")
    .insert([
      { order_id: order.id, type: "customer_approved", phase: order.phase, actor: "customer" },
      { order_id: order.id, type: "phase_change", phase: next, actor: "system" },
    ])
    .select("*");

  await notifyStaffGateResponse(order, "approved", order.phase as "quote_review" | "artwork_approved" | "sample_approved");

  return { ok: true, order: updated as Order, events: (events ?? []) as OrderEvent[] };
}

export async function submitRating(
  slug: string,
  rating: number,
  comment: string
): Promise<{ ok: boolean; error?: string }> {
  await requireCustomerSession(slug);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: "Rating must be between 1 and 5." };
  }
  const db = supabaseServer();

  const { data: order, error } = await db.from("orders").select("id, rating").eq("tracking_slug", slug).single();
  if (error || !order) return { ok: false, error: "Order not found." };
  if (order.rating != null) return { ok: false, error: "Already rated." };

  await db
    .from("orders")
    .update({ rating, rating_comment: comment || null, rated_at: new Date().toISOString() })
    .eq("id", order.id);
  await db.from("order_events").insert({ order_id: order.id, type: "rated", actor: "customer", message: comment || null });

  return { ok: true };
}

export async function requestChanges(
  slug: string,
  note: string
): Promise<{ ok: boolean; order?: Order; events?: OrderEvent[]; error?: string }> {
  await requireCustomerSession(slug);
  const db = supabaseServer();

  const { data: order, error } = await db
    .from("orders")
    .select("id, phase, order_number, customer_name")
    .eq("tracking_slug", slug)
    .single();
  if (error || !order) return { ok: false, error: "Order not found." };
  if (!isGatePhase(order.phase)) return { ok: false, error: "Nothing to revise." };
  if (order.phase === "quote_review" && !note.trim()) {
    return { ok: false, error: "Please tell us why so we can send a new quote." };
  }

  const prev = prevNonGatePhase(order.phase);

  const { data: updated, error: updateError } = await db
    .from("orders")
    .update({ phase: prev, updated_at: new Date().toISOString() })
    .eq("id", order.id)
    .select("*")
    .single();
  if (updateError || !updated) return { ok: false, error: updateError?.message ?? "Update failed." };

  const { data: events } = await db
    .from("order_events")
    .insert([
      {
        order_id: order.id,
        type: "customer_requested_changes",
        phase: order.phase,
        actor: "customer",
        message: note || null,
      },
      { order_id: order.id, type: "phase_change", phase: prev, actor: "system" },
    ])
    .select("*");

  await notifyStaffGateResponse(order, "changes_requested", order.phase as "quote_review" | "artwork_approved" | "sample_approved", note);

  return { ok: true, order: updated as Order, events: (events ?? []) as OrderEvent[] };
}
