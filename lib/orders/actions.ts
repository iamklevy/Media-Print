"use server";

import crypto from "node:crypto";

import { supabaseServer } from "@/lib/supabase/server";
import { createStaffSession, destroyStaffSession, requireStaffSession, verifyStaffPin as checkStaffPin } from "@/lib/auth/staff";
import { createCustomerSession, lastFourMatches, requireCustomerSession } from "@/lib/auth/customer";
import { isGatePhase, nextPhase, prevNonGatePhase } from "@/lib/orders/phases";
import { setOpsLocaleCookie, type OpsLocale } from "@/lib/ops-locale";
import { trackingUrl } from "@/lib/orders/tracking";
import { notifyQuoteReceived, notifyGateReady, notifyDelivered, notifyStaffGateResponse } from "@/lib/email/notify";
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

/**
 * Uploads the design file(s) a customer attaches to the quote form. Stored
 * under a "customer/" prefix in the same bucket the staff-uploaded artwork
 * proofs use, so the two never collide.
 */
async function uploadCustomerArtwork(orderId: string, files: File[]): Promise<ArtworkFile[]> {
  const db = supabaseServer();
  const uploaded: ArtworkFile[] = [];

  for (let i = 0; i < files.length && i < CUSTOMER_ARTWORK_MAX_FILES; i++) {
    const file = files[i];
    if (!(file instanceof File) || file.size === 0) continue;
    if (file.size > CUSTOMER_ARTWORK_MAX_BYTES || !CUSTOMER_ARTWORK_EXT_RE.test(file.name)) continue;

    const ext = file.name.split(".").pop()!.toLowerCase();
    const path = `customer/${orderId}/${i}-${Date.now()}.${ext}`;

    try {
      const { error } = await db.storage.from(ARTWORK_BUCKET).upload(path, file, {
        contentType: file.type || "application/octet-stream",
      });
      if (error) {
        console.error("uploadCustomerArtwork: storage upload failed", error);
        continue;
      }
    } catch (err) {
      console.error("uploadCustomerArtwork: storage upload threw", err);
      continue;
    }

    const { data: pub } = db.storage.from(ARTWORK_BUCKET).getPublicUrl(path);
    uploaded.push({ url: pub.publicUrl, label: file.name });
  }

  return uploaded;
}

export async function createOrderFromQuote(
  formData: FormData,
  locale: string
): Promise<{ orderNumber: string; trackingPath: string; trackingUrl: string } | null> {
  const get = (k: string) => (formData.get(k) as string | null)?.trim() ?? "";

  const name = get("name");
  const phone = get("phone");
  const email = get("email");
  if (!name || !phone || !email) return null;

  const company = get("company") || null;
  const product = get("product") || "Not specified";
  const qty = get("qty") || "Not specified";
  const message = get("message") || null;
  const source = get("source") || "quote_form";

  const slug = randomSlugSuffix();

  const db = supabaseServer();
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

  const artworkInputFiles = formData.getAll("artwork").filter((f): f is File => f instanceof File && f.size > 0);
  let customerArtworkFiles: ArtworkFile[] = [];
  if (artworkInputFiles.length > 0) {
    customerArtworkFiles = await uploadCustomerArtwork(data.id, artworkInputFiles);
    if (customerArtworkFiles.length > 0) {
      await db.from("orders").update({ customer_artwork_files: customerArtworkFiles }).eq("id", data.id);
    }
  }

  await db.from("order_events").insert({
    order_id: data.id,
    type: "created",
    phase: "order_confirmed",
    actor: "system",
    message: customerArtworkFiles.length > 0 ? `Customer attached ${customerArtworkFiles.length} design file(s).` : null,
  });

  await notifyQuoteReceived({ ...(data as Order), customer_artwork_files: customerArtworkFiles });

  return {
    orderNumber: data.order_number,
    trackingPath: `${locale === "ar" ? "/ar" : ""}/track/${data.tracking_slug}`,
    trackingUrl: trackingUrl(data.tracking_slug, locale),
  };
}

// ---------------------------------------------------------------------------
// Staff auth
// ---------------------------------------------------------------------------

export async function staffLogin(pin: string): Promise<{ ok: boolean }> {
  if (!checkStaffPin(pin)) return { ok: false };
  await createStaffSession();
  return { ok: true };
}

export async function staffLogout(): Promise<void> {
  await destroyStaffSession();
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
  await requireStaffSession();
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

  const next = nextPhase(order.phase);
  if (!next) return { ok: false, error: "Order is already delivered." };

  const update: Partial<Order> = { phase: next, updated_at: new Date().toISOString() };
  if (next === "delivered") update.delivered_at = new Date().toISOString();

  const { error: updateError } = await db.from("orders").update(update).eq("id", orderId);
  if (updateError) return { ok: false, error: updateError.message };

  await db.from("order_events").insert({ order_id: orderId, type: "phase_change", phase: next, actor: "staff" });

  if (next === "artwork_approved" || next === "sample_approved") {
    await notifyGateReady({ ...(order as Order), phase: next }, next);
  }
  if (next === "delivered") {
    await notifyDelivered({ ...(order as Order), phase: next });
  }

  return { ok: true };
}

const SAMPLE_BUCKET = "sample-photos";
const SAMPLE_MAX_BYTES = 5 * 1024 * 1024;
const SAMPLE_MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function uploadSampleImage(
  orderId: string,
  slot: number,
  formData: FormData
): Promise<{ ok: boolean; url?: string; error?: string }> {
  await requireStaffSession();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "No file provided." };
  const ext = SAMPLE_MIME_EXT[file.type];
  if (!ext) return { ok: false, error: "Unsupported file type — use JPEG, PNG or WebP." };
  if (file.size > SAMPLE_MAX_BYTES) return { ok: false, error: "File too large — 5MB max." };

  const db = supabaseServer();
  const path = `${orderId}/${slot}-${Date.now()}.${ext}`;

  try {
    const { error: uploadError } = await db.storage.from(SAMPLE_BUCKET).upload(path, file, {
      contentType: file.type,
      upsert: true,
    });
    if (uploadError) return { ok: false, error: uploadError.message };
  } catch (err) {
    // Storage-side limits (e.g. the bucket's own max file size in the
    // Supabase dashboard) can reject the upload with a thrown error rather
    // than a returned one — surface it to the caller instead of letting it
    // vanish into the server log as an unhandled action failure.
    console.error("uploadSampleImage: storage upload threw", err);
    return { ok: false, error: err instanceof Error ? err.message : "Upload failed — file may be too large." };
  }

  const { data: pub } = db.storage.from(SAMPLE_BUCKET).getPublicUrl(path);

  const { data: order, error: fetchError } = await db
    .from("orders")
    .select("sample_images")
    .eq("id", orderId)
    .single();
  if (fetchError || !order) return { ok: false, error: "Order not found." };

  const images: SampleImage[] = [...((order.sample_images ?? []) as SampleImage[])];
  while (images.length <= slot) images.push({ url: "" });
  images[slot] = { url: pub.publicUrl };

  const { error: updateError } = await db
    .from("orders")
    .update({ sample_images: images, updated_at: new Date().toISOString() })
    .eq("id", orderId);
  if (updateError) return { ok: false, error: updateError.message };

  return { ok: true, url: pub.publicUrl };
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

export async function uploadArtworkFile(
  orderId: string,
  slot: number,
  formData: FormData
): Promise<{ ok: boolean; url?: string; error?: string }> {
  await requireStaffSession();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "No file provided." };
  const ext = SAMPLE_MIME_EXT[file.type];
  if (!ext) return { ok: false, error: "Unsupported file type — use JPEG, PNG or WebP." };
  if (file.size > SAMPLE_MAX_BYTES) return { ok: false, error: "File too large — 5MB max." };

  const db = supabaseServer();
  const path = `${orderId}/${slot}-${Date.now()}.${ext}`;

  try {
    const { error: uploadError } = await db.storage.from(ARTWORK_BUCKET).upload(path, file, {
      contentType: file.type,
      upsert: true,
    });
    if (uploadError) return { ok: false, error: uploadError.message };
  } catch (err) {
    console.error("uploadArtworkFile: storage upload threw", err);
    return { ok: false, error: err instanceof Error ? err.message : "Upload failed — file may be too large." };
  }

  const { data: pub } = db.storage.from(ARTWORK_BUCKET).getPublicUrl(path);

  const { data: order, error: fetchError } = await db
    .from("orders")
    .select("artwork_files")
    .eq("id", orderId)
    .single();
  if (fetchError || !order) return { ok: false, error: "Order not found." };

  const files: ArtworkFile[] = [...((order.artwork_files ?? []) as ArtworkFile[])];
  while (files.length <= slot) files.push({ url: "" });
  files[slot] = { url: pub.publicUrl };

  const { error: updateError } = await db
    .from("orders")
    .update({ artwork_files: files, updated_at: new Date().toISOString() })
    .eq("id", orderId);
  if (updateError) return { ok: false, error: updateError.message };

  return { ok: true, url: pub.publicUrl };
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

const INVOICE_MAX_BYTES = 10 * 1024 * 1024; // matches the "artwork-files" bucket's own cap

export async function uploadCustomInvoice(
  orderId: string,
  formData: FormData
): Promise<{ ok: boolean; url?: string; error?: string }> {
  await requireStaffSession();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "No file provided." };
  if (file.type !== "application/pdf") return { ok: false, error: "Unsupported file type — use PDF." };
  if (file.size > INVOICE_MAX_BYTES) return { ok: false, error: "File too large — 10MB max." };

  const db = supabaseServer();
  const path = `invoices/${orderId}/${Date.now()}.pdf`;

  try {
    const { error: uploadError } = await db.storage.from(ARTWORK_BUCKET).upload(path, file, {
      contentType: "application/pdf",
      upsert: true,
    });
    if (uploadError) return { ok: false, error: uploadError.message };
  } catch (err) {
    console.error("uploadCustomInvoice: storage upload threw", err);
    return { ok: false, error: err instanceof Error ? err.message : "Upload failed — file may be too large." };
  }

  const { data: pub } = db.storage.from(ARTWORK_BUCKET).getPublicUrl(path);
  const invoiceFile: ArtworkFile = { url: pub.publicUrl, label: file.name };

  const { error: updateError } = await db
    .from("orders")
    .update({ invoice_file: invoiceFile, updated_at: new Date().toISOString() })
    .eq("id", orderId);
  if (updateError) return { ok: false, error: updateError.message };

  return { ok: true, url: pub.publicUrl };
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
      "unit_price" | "order_total" | "lead_time_days" | "estimated_delivery" | "quantity" | "product_label"
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
  await requireStaffSession();
  const db = supabaseServer();

  const { data: order, error } = await db
    .from("orders")
    .select("order_number, product_label, phase")
    .eq("id", orderId)
    .single();
  if (error || !order) return { ok: false, error: "Order not found." };

  await db.from("order_events").insert({ order_id: orderId, type: "reminder_sent", actor: "staff" });

  return {
    ok: true,
    message: `Hi! Order ${order.order_number} (${order.product_label}) is waiting on your approval — could you take a look when you get a chance?`,
  };
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

  await notifyStaffGateResponse(order, "approved", order.phase as "artwork_approved" | "sample_approved");

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

  await notifyStaffGateResponse(order, "changes_requested", order.phase as "artwork_approved" | "sample_approved", note);

  return { ok: true, order: updated as Order, events: (events ?? []) as OrderEvent[] };
}
