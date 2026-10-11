/** One sub-type chip shown on an industry's landing filter — labelKey is the
 * i18n key for the business's literal wording, typeSlug is what it maps to for product
 * matching against CatalogueProduct.types (see content/products.ts). */
export interface IndustryType {
  labelKey: string;
  typeSlug: string;
}

export interface Industry {
  slug: string;
  /** i18n key prefix -> industry.<slug>.name / .blurb */
  key: string;
  image: string;
  types: IndustryType[];
}

export const INDUSTRIES: Industry[] = [
  {
    slug: "cosmetics",
    key: "industry.cosmetics",
    image: "/products/cartons-luvira-serum-box-unfolded.png",
    types: [
      { labelKey: "industry.chip.packaging", typeSlug: "boxes" },
      { labelKey: "industry.chip.labels", typeSlug: "labels" },
      { labelKey: "industry.chip.bags", typeSlug: "bags" },
      { labelKey: "industry.chip.cards", typeSlug: "cards" },
    ],
  },
  {
    slug: "food",
    key: "industry.food",
    image: "/products/industry-food-aljabal-olive-oil-bottles.jpg",
    types: [
      { labelKey: "industry.chip.labels", typeSlug: "labels" },
      { labelKey: "industry.chip.zipper_pouch_bags", typeSlug: "zipper-pouches" },
      { labelKey: "industry.chip.bags", typeSlug: "bags" },
      { labelKey: "industry.chip.flyers", typeSlug: "flyers" },
    ],
  },
  {
    slug: "clothing",
    key: "industry.clothing",
    image: "/products/apparel-monest-london-grey-ziplock.jpg",
    types: [
      { labelKey: "industry.chip.labels", typeSlug: "labels" },
      { labelKey: "industry.chip.hang_tags", typeSlug: "hang-tags" },
      { labelKey: "industry.chip.zipper_bags", typeSlug: "zipper-pouches" },
      { labelKey: "industry.chip.boxes", typeSlug: "boxes" },
      { labelKey: "industry.chip.flyers", typeSlug: "flyers" },
      { labelKey: "industry.chip.cards", typeSlug: "cards" },
    ],
  },
  {
    slug: "ecommerce",
    key: "industry.ecommerce",
    image: "/products/corrugated-nuit-mailer-box-open-perfume.jpg",
    types: [
      { labelKey: "industry.chip.shipping_boxes", typeSlug: "boxes" },
      { labelKey: "industry.chip.shipping_bags", typeSlug: "bags" },
      { labelKey: "industry.chip.labels_stickers", typeSlug: "labels" },
      { labelKey: "industry.chip.cards_inserts", typeSlug: "cards" },
    ],
  },
];

/** The 6 cross-industry types shown in the homepage "Explore our packaging
 * solutions" section — each links to /products?type=<slug>. */
export interface SolutionType {
  slug: string;
  /** i18n key -> solution.<slug> */
  key: string;
  /** i18n key -> solutionDesc.<slug>, the one-liner under the card title */
  descKey: string;
  image: string;
}

export const SOLUTION_TYPES: SolutionType[] = [
  { slug: "labels", key: "solution.labels", descKey: "solutionDesc.labels", image: "/products/stickers-clear-label-roll-pair.jpg" },
  { slug: "boxes", key: "solution.boxes", descKey: "solutionDesc.boxes", image: "/products/cartons-smile-wonders-mouthwash-trio.jpg" },
  { slug: "bags", key: "solution.bags", descKey: "solutionDesc.bags", image: "/products/paper-bags-biomedica-teal-flat.jpg" },
  { slug: "cards", key: "solution.cards", descKey: "solutionDesc.cards", image: "/products/tags-nasaq-women-hang-tag.jpg" },
  { slug: "flyers", key: "solution.flyers", descKey: "solutionDesc.flyers", image: "/products/flyers-nounas-bakery-iced-coffee.jpg" },
  { slug: "zipper-pouches", key: "solution.zipperpouches", descKey: "solutionDesc.zipperpouches", image: "/products/zipper-loops-travel-bottle-ziplock.jpg" },
];
