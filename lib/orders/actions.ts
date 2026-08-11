"use server";

import crypto from "node:crypto";

import { supabaseServer } from "@/lib/supabase/server";
import { createStaffSession, destroyStaffSession, requireStaffSession, verifyStaffPin as checkStaffPin } from "@/lib/auth/staff";
import { createCustomerSession, lastFourMatches, requireCustomerSession } from "@/lib/auth/customer";
import { isGatePhase, nextPhase, prevNonGatePhase } from "@/lib/orders/phases";
import { setOpsLocaleCookie, type OpsLocale } from "@/lib/ops-locale";
import type { Order, OrderEvent, SampleImage } from "@/lib/orders/types";

const FAILED_ATTEMPT_LIMIT = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

function randomSlugSuffix(): string {
  return crypto.randomBytes(8).toString("base64url");
}

// ---------------------------------------------------------------------------
// Quote form -> order creation
// ---------------------------------------------------------------------------

export async function createOrderFromQuote(
  formData: FormData,
  locale: string
): Promise<{ orderNumber: string; trackingPath: string; trackingUrl: string } | null> {
  const get = (k: string) => (formData.get(k) as string | null)?.trim() ?? "";

  const name = get("name");
  const phone = get("phone");
  if (!name || !phone) return null;

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
      customer_company: company,
      product_label: product,
      quantity: qty,
      notes: message,
      source,
    })
    .select("id, order_number, tracking_slug")
    .single();

  if (error || !data) {
    console.error("createOrderFromQuote failed", error);
    return null;
  }

  await db.from("order_events").insert({
    order_id: data.id,
    type: "created",
    phase: "order_confirmed",
    actor: "system",
  });

  const trackingPath = `${locale === "ar" ? "/ar" : ""}/track/${data.tracking_slug}`;
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");

  return {
    orderNumber: data.order_number,
    trackingPath,
    trackingUrl: `${base}${trackingPath}`,
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
    .select("phase")
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

  const { error: uploadError } = await db.storage.from(SAMPLE_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: true,
  });
  if (uploadError) return { ok: false, error: uploadError.message };

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

  const { data: order, error } = await db.from("orders").select("id, phase").eq("tracking_slug", slug).single();
  if (error || !order) return { ok: false, error: "Order not found." };
  if (!isGatePhase(order.phase)) return { ok: false, error: "Nothing to approve." };

  const next = nextPhase(order.phase);
  if (!next) return { ok: false, error: "Order has no next phase." };

  const { data: updated, error: updateError } = await db
    .from("orders")
    .update({ phase: next, updated_at: new Date().toISOString() })
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

  const { data: order, error } = await db.from("orders").select("id, phase").eq("tracking_slug", slug).single();
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

  return { ok: true, order: updated as Order, events: (events ?? []) as OrderEvent[] };
}
