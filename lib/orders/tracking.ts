// Shared with lib/orders/actions.ts (order creation) and the ops dashboard,
// so both places build the exact same URL from a tracking_slug.
export function trackingUrl(slug: string, locale: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  const path = `${locale === "ar" ? "/ar" : ""}/track/${slug}`;
  return `${base}${path}`;
}
