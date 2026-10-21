import type { Order } from "@/lib/orders/types";

import QuoteReceived from "@/emails/quote-received";
import GateReady, { GATE_COPY, type Gate } from "@/emails/gate-ready";
import Delivered from "@/emails/delivered";
import BookingReceived, { type BookingReceivedProps } from "@/emails/booking-received";
import StaffNewQuote, { type StaffNewQuoteProps } from "@/emails/staff-new-quote";
import StaffBookingRequest, { type StaffBookingRequestProps } from "@/emails/staff-booking-request";
import StaffGateResponse from "@/emails/staff-gate-response";
import StaffSetPassword from "@/emails/staff-set-password";

// Each builder pairs a subject line with its React Email component (in
// /emails, previewable with `npm run email`). sendEmail renders `react`
// to HTML + plain text at send time.

const isAr = (locale: string) => locale === "ar";

// ---------------------------------------------------------------------------
// Customer-facing
// ---------------------------------------------------------------------------

export function quoteReceivedEmail(order: Pick<Order, "order_number" | "customer_name" | "product_label">, trackingUrl: string, locale: string) {
  return {
    subject: isAr(locale) ? `استلمنا طلبك — ${order.order_number}` : `We received your request — ${order.order_number}`,
    react: (
      <QuoteReceived
        locale={locale}
        name={order.customer_name}
        orderNumber={order.order_number}
        product={order.product_label}
        trackingUrl={trackingUrl}
      />
    ),
  };
}

export function gateReadyEmail(
  order: Pick<Order, "order_number" | "customer_name">,
  gate: Gate,
  trackingUrl: string,
  locale: string
) {
  const heading = GATE_COPY[gate][isAr(locale) ? "ar" : "en"];
  return {
    subject: `${heading} — ${order.order_number}`,
    react: (
      <GateReady
        locale={locale}
        name={order.customer_name}
        orderNumber={order.order_number}
        gate={gate}
        trackingUrl={trackingUrl}
      />
    ),
  };
}

export function deliveredEmail(order: Pick<Order, "order_number" | "customer_name">, trackingUrl: string, locale: string) {
  return {
    subject: isAr(locale) ? `طلبك اتسلم — ${order.order_number}` : `Your order has been delivered — ${order.order_number}`,
    react: (
      <Delivered locale={locale} name={order.customer_name} orderNumber={order.order_number} trackingUrl={trackingUrl} />
    ),
  };
}

export function bookingReceivedEmail(fields: Omit<BookingReceivedProps, "locale">, locale: string) {
  return {
    subject: isAr(locale) ? "استلمنا طلب حجز الاجتماع" : "We received your meeting request",
    react: <BookingReceived locale={locale} {...fields} />,
  };
}

// ---------------------------------------------------------------------------
// Internal staff notifications (always in English, regardless of customer locale)
// ---------------------------------------------------------------------------

export function staffNewQuoteEmail(order: StaffNewQuoteProps) {
  return {
    subject: `New quote request — ${order.customer_name} (${order.order_number})`,
    react: <StaffNewQuote {...order} />,
  };
}

export function staffBookingRequestEmail(fields: StaffBookingRequestProps) {
  return {
    subject: `New meeting booking — ${fields.name}`,
    react: <StaffBookingRequest {...fields} />,
  };
}

export function staffSetPasswordEmail(actionLink: string) {
  return {
    subject: "Set your password — Media Print Pack Operations",
    react: <StaffSetPassword actionLink={actionLink} />,
  };
}

export function staffGateResponseEmail(
  order: { order_number: string; customer_name: string },
  kind: "approved" | "changes_requested",
  gate: Gate,
  note?: string | null
) {
  return {
    subject: `${order.customer_name} ${kind === "approved" ? "approved" : "requested changes"} — ${order.order_number}`,
    react: (
      <StaffGateResponse
        order_number={order.order_number}
        customer_name={order.customer_name}
        kind={kind}
        gate={gate}
        note={note}
      />
    ),
  };
}
