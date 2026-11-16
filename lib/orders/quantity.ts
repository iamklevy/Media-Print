/**
 * Fixed quantity-range codes a customer can request via the quote form.
 * Orders created before this change may still carry arbitrary free text
 * (e.g. "5,000 bags") in `quantity` — treat anything outside this set as
 * legacy text rather than a parsing error.
 */
export const QUANTITY_RANGES = [
  "100_500", // legacy — no longer offered, kept so older orders still display
  "300_500",
  "500_1000",
  "1000_5000",
  "5000_10000",
  "10000_plus",
] as const;

export type QuantityRange = (typeof QUANTITY_RANGES)[number];

export function isQuantityRange(value: string): value is QuantityRange {
  return (QUANTITY_RANGES as readonly string[]).includes(value);
}

/** Minimum order quantities: clothing packaging (garment bags, zipper bags, hang tags) starts at 300, everything else at 1,000. */
export const MOQ_CLOTHING = 300;
export const MOQ_DEFAULT = 1000;

/** Ranges a customer may pick for a product with the given minimum order quantity. */
export function quantityRangesFor(moq: number): QuantityRange[] {
  return QUANTITY_RANGES.filter((code) => code !== "100_500" && quantityRangeLowerBound(code) >= moq);
}

const ENGLISH_LABELS: Record<QuantityRange, string> = {
  "100_500": "100 – 500",
  "300_500": "300 – 500",
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
