import type { ArtworkFile, Order } from "@/lib/orders/types";
import { SALES_PHONE } from "@/lib/contact";

const isAr = (locale: string): locale is "ar" => locale === "ar";

function layout(locale: string, bodyHtml: string): string {
  const ar = isAr(locale);
  return `<!doctype html>
<html lang="${ar ? "ar" : "en"}" dir="${ar ? "rtl" : "ltr"}">
  <body style="margin:0;padding:0;background:#f4f2ee;font-family:Tahoma,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2ee;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:480px;background:#ffffff;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="background:#1a1a1a;padding:20px 28px;">
                <span style="color:#ffffff;font-size:18px;font-weight:700;">Media Print Pack</span>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;color:#1a1a1a;font-size:15px;line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px;background:#f4f2ee;color:#6b6b6b;font-size:12px;" dir="ltr">
                ${SALES_PHONE} · mediaprint-eg.com
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function button(url: string, label: string): string {
  return `<p style="margin:24px 0;"><a href="${url}" style="display:inline-block;background:#c4432c;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:999px;">${label}</a></p>`;
}

// ---------------------------------------------------------------------------
// Customer-facing
// ---------------------------------------------------------------------------

export function quoteReceivedEmail(order: Pick<Order, "order_number" | "customer_name" | "product_label">, trackingUrl: string, locale: string) {
  const ar = isAr(locale);
  const body = ar
    ? `<p>أهلاً ${order.customer_name}،</p>
       <p>استلمنا طلب عرض السعر بتاعك (<strong dir="ltr">${order.order_number}</strong>) لـ ${order.product_label}. هنراجعه ونرجعلك بعرض السعر قريب.</p>
       <p>تقدر تتابع حالة طلبك في أي وقت من الرابط ده:</p>
       ${button(trackingUrl, "تابع طلبك")}`
    : `<p>Hi ${order.customer_name},</p>
       <p>We've received your quote request (<strong dir="ltr">${order.order_number}</strong>) for ${order.product_label}. We'll review it and get back to you with pricing shortly.</p>
       <p>You can follow your order's status anytime from this link:</p>
       ${button(trackingUrl, "Track your order")}`;
  return {
    subject: ar ? `استلمنا طلبك — ${order.order_number}` : `We received your request — ${order.order_number}`,
    html: layout(locale, body),
  };
}

const GATE_COPY: Record<"artwork_approved" | "sample_approved", { ar: string; en: string }> = {
  artwork_approved: { ar: "التصميم جاهز للمراجعة", en: "Your artwork is ready for review" },
  sample_approved: { ar: "العينة جاهزة للمراجعة", en: "Your sample is ready for review" },
};

export function gateReadyEmail(
  order: Pick<Order, "order_number" | "customer_name">,
  gate: "artwork_approved" | "sample_approved",
  trackingUrl: string,
  locale: string
) {
  const ar = isAr(locale);
  const heading = GATE_COPY[gate][locale === "ar" ? "ar" : "en"];
  const body = ar
    ? `<p>أهلاً ${order.customer_name}،</p>
       <p>${heading} لطلبك <strong dir="ltr">${order.order_number}</strong>. من فضلك راجعه ووافق عليه أو اطلب تعديلات من صفحة المتابعة:</p>
       ${button(trackingUrl, "راجع الطلب")}`
    : `<p>Hi ${order.customer_name},</p>
       <p>${heading} for order <strong dir="ltr">${order.order_number}</strong>. Please take a look and approve it or request changes from your tracking page:</p>
       ${button(trackingUrl, "Review order")}`;
  return {
    subject: ar ? `${heading} — ${order.order_number}` : `${heading} — ${order.order_number}`,
    html: layout(locale, body),
  };
}

export function deliveredEmail(order: Pick<Order, "order_number" | "customer_name">, trackingUrl: string, locale: string) {
  const ar = isAr(locale);
  const body = ar
    ? `<p>أهلاً ${order.customer_name}،</p>
       <p>طلبك <strong dir="ltr">${order.order_number}</strong> اتسلم بنجاح. تشرفنا نشتغل معاك!</p>
       <p>ياريت تقيّم تجربتك من صفحة المتابعة — بياخد ثانيتين وبيفرق معانا كتير:</p>
       ${button(trackingUrl, "قيّم طلبك")}`
    : `<p>Hi ${order.customer_name},</p>
       <p>Your order <strong dir="ltr">${order.order_number}</strong> has been delivered. Thanks for working with us!</p>
       <p>We'd love it if you could rate your experience from your tracking page — it only takes a second and helps a lot:</p>
       ${button(trackingUrl, "Rate your order")}`;
  return {
    subject: ar ? `طلبك اتسلم — ${order.order_number}` : `Your order has been delivered — ${order.order_number}`,
    html: layout(locale, body),
  };
}

// ---------------------------------------------------------------------------
// Internal staff notifications (always in English, regardless of customer locale)
// ---------------------------------------------------------------------------

export function staffNewQuoteEmail(order: {
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  product_label: string;
  quantity: string;
  notes: string | null;
  customer_artwork_files?: ArtworkFile[];
}) {
  const files = (order.customer_artwork_files ?? []).filter((f) => f.url);
  const body = `<p>New quote request — <strong dir="ltr">${order.order_number}</strong></p>
    <p>
      Name: ${order.customer_name}<br/>
      Phone: <span dir="ltr">${order.customer_phone}</span><br/>
      Email: <span dir="ltr">${order.customer_email}</span><br/>
      Product: ${order.product_label}<br/>
      Quantity: ${order.quantity}
    </p>
    ${order.notes ? `<p>Message: ${order.notes}</p>` : ""}
    ${
      files.length > 0
        ? `<p>Design file(s):<br/>${files.map((f) => `<a href="${f.url}" dir="ltr">${f.label ?? f.url}</a>`).join("<br/>")}</p>`
        : ""
    }`;
  return {
    subject: `New quote request — ${order.customer_name} (${order.order_number})`,
    html: layout("en", body),
  };
}

export function staffGateResponseEmail(
  order: { order_number: string; customer_name: string },
  kind: "approved" | "changes_requested",
  gate: "artwork_approved" | "sample_approved",
  note?: string | null
) {
  const gateLabel = gate === "artwork_approved" ? "artwork" : "sample";
  const action = kind === "approved" ? `approved the ${gateLabel}` : `requested changes to the ${gateLabel}`;
  const body = `<p><strong>${order.customer_name}</strong> ${action} for order <strong dir="ltr">${order.order_number}</strong>.</p>
    ${note ? `<p>Note: ${note}</p>` : ""}`;
  return {
    subject: `${order.customer_name} ${kind === "approved" ? "approved" : "requested changes"} — ${order.order_number}`,
    html: layout("en", body),
  };
}
