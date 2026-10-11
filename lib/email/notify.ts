import "server-only";

import { sendEmail } from "@/lib/email/client";
import {
  quoteReceivedEmail,
  gateReadyEmail,
  deliveredEmail,
  staffNewQuoteEmail,
  staffGateResponseEmail,
  staffBookingRequestEmail,
} from "@/lib/email/templates";
import { FOOTER_EMAIL as STAFF_EMAIL } from "@/lib/contact";
import { trackingUrl } from "@/lib/orders/tracking";
import type { Order } from "@/lib/orders/types";

export async function notifyQuoteReceived(order: Order): Promise<void> {
  const url = trackingUrl(order.tracking_slug, order.locale);

  if (order.customer_email) {
    const email = quoteReceivedEmail(order, url, order.locale);
    await sendEmail({ to: order.customer_email, ...email });
  }

  const staffEmail = staffNewQuoteEmail({
    order_number: order.order_number,
    customer_name: order.customer_name,
    customer_phone: order.customer_phone,
    customer_email: order.customer_email ?? "—",
    product_label: order.product_label,
    quantity: order.quantity,
    notes: order.notes,
    customer_artwork_files: order.customer_artwork_files,
  });
  await sendEmail({ to: STAFF_EMAIL, ...staffEmail });
}

export async function notifyGateReady(
  order: Order,
  gate: "quote_review" | "artwork_approved" | "sample_approved"
): Promise<void> {
  if (!order.customer_email) return;
  const url = trackingUrl(order.tracking_slug, order.locale);
  const email = gateReadyEmail(order, gate, url, order.locale);
  await sendEmail({ to: order.customer_email, ...email });
}

export async function notifyDelivered(order: Order): Promise<void> {
  if (!order.customer_email) return;
  const url = trackingUrl(order.tracking_slug, order.locale);
  const email = deliveredEmail(order, url, order.locale);
  await sendEmail({ to: order.customer_email, ...email });
}

export async function notifyBookingRequest(fields: Parameters<typeof staffBookingRequestEmail>[0]): Promise<void> {
  const email = staffBookingRequestEmail(fields);
  await sendEmail({ to: STAFF_EMAIL, ...email });
}

export async function notifyStaffGateResponse(
  order: Pick<Order, "order_number" | "customer_name">,
  kind: "approved" | "changes_requested",
  gate: "quote_review" | "artwork_approved" | "sample_approved",
  note?: string | null
): Promise<void> {
  const email = staffGateResponseEmail(order, kind, gate, note);
  await sendEmail({ to: STAFF_EMAIL, ...email });
}
