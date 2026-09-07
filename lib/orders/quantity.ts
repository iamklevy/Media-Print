/**
 * Fixed quantity-range codes a customer can request via the quote form.
 * Orders created before this change may still carry arbitrary free text
 * (e.g. "5,000 bags") in `quantity` — treat anything outside this set as
 * legacy text rather than a parsing error.
 */
export const QUANTITY_RANGES = [
  "100_500",
  "500_1000",
  "1000_5000",
  "5000_10000",
  "10000_plus",
] as const;

export type QuantityRange = (typeof QUANTITY_RANGES)[number];

export function isQuantityRange(value: string): value is QuantityRange {
  return (QUANTITY_RANGES as readonly string[]).includes(value);
}

const ENGLISH_LABELS: Record<QuantityRange, string> = {
  "100_500": "100 – 500",
  "500_1000": "500 – 1,000",
  "1000_5000": "1,000 – 5,000",
  "5000_10000": "5,000 – 10,000",
  "10000_plus": "10,000+",
};

/** Plain-English label for contexts without next-intl, e.g. internal staff emails. */
export function quantityRangeLabel(value: string): string {
  return isQuantityRange(value) ? ENGLISH_LABELS[value] : value;
}

/** Lower bound of the range, used as a conservative estimate for order-total math. */
export function quantityRangeLowerBound(value: QuantityRange): number {
  return Number(value.replace("_plus", "").split("_")[0]);
}

/**
 * What to show for "how much are they ordering": the confirmed exact number
 * once negotiation has settled on one, otherwise the originally-requested
 * range (or legacy free text for pre-range orders).
 */
export function formatOrderQuantity(
  order: { quantity: string; confirmed_quantity: number | null },
  tQty: (code: QuantityRange) => string
): string {
  if (order.confirmed_quantity != null) return order.confirmed_quantity.toLocaleString();
  return isQuantityRange(order.quantity) ? tQty(order.quantity) : order.quantity;
}
