/** One sub-type chip shown on an industry's landing filter — label is the
 * business's literal wording, typeSlug is what it maps to for product
 * matching against CatalogueProduct.types (see content/products.ts). */
export interface IndustryType {
  label: string;
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
    image: "/products/cartons.png",
    types: [
      { label: "Packaging", typeSlug: "boxes" },
      { label: "Labels", typeSlug: "labels" },
      { label: "Bags", typeSlug: "bags" },
      { label: "Cards", typeSlug: "cards" },
    ],
  },
  {
    slug: "food",
    key: "industry.food",
    image: "https://images.unsplash.com/photo-1695245503558-5cdb37f49092?w=1100&q=72&auto=format&fit=crop",
    types: [
      { label: "Labels", typeSlug: "labels" },
      { label: "Zipper Pouch Bags", typeSlug: "zipper-pouches" },
      { label: "Bags", typeSlug: "bags" },
      { label: "Flyers", typeSlug: "flyers" },
    ],
  },
  {
    slug: "clothing",
    key: "industry.clothing",
    image: "/products/apparel.jpg",
    types: [
      { label: "Labels", typeSlug: "labels" },
      { label: "Hang Tags", typeSlug: "hang-tags" },
      { label: "Zipper Bags", typeSlug: "zipper-pouches" },
      { label: "Boxes", typeSlug: "boxes" },
      { label: "Flyers", typeSlug: "flyers" },
      { label: "Cards", typeSlug: "cards" },
    ],
  },
  {
    slug: "ecommerce",
    key: "industry.ecommerce",
    image: "https://images.unsplash.com/photo-1766040923580-16ad32fae8b4?w=1100&q=72&auto=format&fit=crop",
    types: [
      { label: "Shipping Boxes", typeSlug: "boxes" },
      { label: "Shipping Bags", typeSlug: "bags" },
      { label: "Labels & Stickers", typeSlug: "labels" },
      { label: "Cards & Inserts", typeSlug: "cards" },
    ],
  },
];

/** The 6 cross-industry types shown in the homepage "Explore our packaging
 * solutions" section — each links to /products?type=<slug>. */
export interface SolutionType {
  slug: string;
  /** i18n key -> solution.<slug> */
  key: string;
}

export const SOLUTION_TYPES: SolutionType[] = [
  { slug: "labels", key: "solution.labels" },
  { slug: "boxes", key: "solution.boxes" },
  { slug: "bags", key: "solution.bags" },
  { slug: "cards", key: "solution.cards" },
  { slug: "flyers", key: "solution.flyers" },
  { slug: "zipper-pouches", key: "solution.zipperpouches" },
];
