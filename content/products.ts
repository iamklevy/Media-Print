export interface CatalogueProduct {
  slug: string;
  /** i18n key prefix, e.g. "p.zipper" -> p.zipper.t / .d / .s1 */
  key: string;
  cat: "plastic" | "paper" | "fabric" | "print";
  /** Industry slugs this product is sold under — see content/industries.ts */
  industries: string[];
  /** Solution-type slugs (labels/boxes/bags/cards/flyers/zipper-pouches/hang-tags) */
  types: string[];
  /** First entry is the cover image, used by the catalogue grid, OG tags and JSON-LD. */
  images: string[];
  specs: string[];
  /** key into PRICING.products, or null when we have no verified prices */
  pricing: string | null;
}

export const PRODUCTS: CatalogueProduct[] = [
  {
    "slug": "zipper",
    "key": "p.zipper",
    "cat": "plastic",
    "industries": ["food", "clothing"],
    "types": ["zipper-pouches"],
    "images": ["https://images.unsplash.com/photo-1586490914534-b60b88a8f3a6?w=1100&q=72&auto=format&fit=crop"],
    "specs": [
      "p.zipper.s1",
      "p.zipper.s2",
      "p.zipper.s3"
    ],
    "pricing": null
  },
  {
    "slug": "paper-sacks",
    "key": "p.sacks",
    "cat": "paper",
    "industries": ["food"],
    "types": ["bags"],
    "images": ["https://images.unsplash.com/photo-1695245503558-5cdb37f49092?w=1100&q=72&auto=format&fit=crop"],
    "specs": [
      "p.sacks.s1",
      "p.sacks.s2",
      "p.sacks.s3"
    ],
    "pricing": null
  },
  {
    "slug": "apparel",
    "key": "p.apparel",
    "cat": "plastic",
    "industries": ["clothing"],
    "types": ["zipper-pouches", "bags"],
    "images": ["/products/apparel.jpg", "/products/apparel-2.jpg", "/products/apparel-3.png", "/products/apparel-4.jpg"],
    "specs": [
      "p.apparel.s1",
      "p.apparel.s2",
      "p.apparel.s3"
    ],
    "pricing": "apparel"
  },
  {
    "slug": "nonwoven",
    "key": "p.nonwoven",
    "cat": "fabric",
    "industries": ["clothing", "food"],
    "types": ["bags"],
    "images": ["https://images.unsplash.com/photo-1572196284554-4e321b0e7e0b?w=1100&q=72&auto=format&fit=crop"],
    "specs": [
      "p.nonwoven.s1",
      "p.nonwoven.s2",
      "p.nonwoven.s3"
    ],
    "pricing": "nonwoven"
  },
  {
    "slug": "courier",
    "key": "p.courier",
    "cat": "plastic",
    "industries": ["ecommerce"],
    "types": ["bags"],
    "images": ["https://images.unsplash.com/photo-1617912760188-9ef603157f1e?w=1100&q=72&auto=format&fit=crop"],
    "specs": [
      "p.courier.s1",
      "p.courier.s2",
      "p.courier.s3"
    ],
    "pricing": "courier"
  },
  {
    "slug": "paper-bags",
    "key": "p.paperbags",
    "cat": "paper",
    "industries": ["cosmetics", "food", "clothing"],
    "types": ["bags"],
    "images": ["/products/paper-bags.jpg", "/products/paper-bags-coated.jpg"],
    "specs": [
      "p.paperbags.s1",
      "p.paperbags.s2",
      "p.paperbags.s3"
    ],
    "pricing": "paper-bags"
  },
  {
    "slug": "stickers",
    "key": "p.stickers",
    "cat": "print",
    "industries": ["cosmetics", "food", "clothing", "ecommerce"],
    "types": ["labels"],
    "images": ["https://images.unsplash.com/photo-1572950947476-26a6e4111e80?w=1100&q=72&auto=format&fit=crop"],
    "specs": [
      "p.stickers.s1",
      "p.stickers.s2",
      "p.stickers.s3"
    ],
    "pricing": null
  },
  {
    "slug": "cartons",
    "key": "p.cartons",
    "cat": "paper",
    "industries": ["cosmetics", "clothing"],
    "types": ["boxes"],
    "images": [
      "/products/cartons.png",
      "/products/cartons-2.png",
      "/products/cartons-3.png",
      "/products/cartons-4.png",
      "/products/cartons-5.png",
      "/products/cartons-6.png",
      "/products/cartons-7.png",
      "/products/cartons-8.png",
      "/products/cartons-9.png"
    ],
    "specs": [
      "p.cartons.s1",
      "p.cartons.s2",
      "p.cartons.s3"
    ],
    "pricing": null
  },
  {
    "slug": "tags",
    "key": "p.tags",
    "cat": "print",
    "industries": ["clothing", "cosmetics", "ecommerce"],
    "types": ["hang-tags", "cards"],
    "images": ["https://images.unsplash.com/photo-1637291454111-1d115acb5023?w=1100&q=72&auto=format&fit=crop"],
    "specs": [
      "p.tags.s1",
      "p.tags.s2",
      "p.tags.s3"
    ],
    "pricing": "tags"
  },
  {
    "slug": "corrugated",
    "key": "p.corrugated",
    "cat": "paper",
    "industries": ["ecommerce", "clothing"],
    "types": ["boxes"],
    "images": ["https://images.unsplash.com/photo-1766040923580-16ad32fae8b4?w=1100&q=72&auto=format&fit=crop"],
    "specs": [
      "p.corrugated.s1",
      "p.corrugated.s2",
      "p.corrugated.s3"
    ],
    "pricing": "corrugated"
  },
  {
    "slug": "sacks-5kg",
    "key": "p.sacks5",
    "cat": "plastic",
    "industries": ["food"],
    "types": ["bags"],
    "images": ["https://images.unsplash.com/photo-1706881811917-6590b1054050?w=1100&q=72&auto=format&fit=crop"],
    "specs": [
      "p.sacks5.s1",
      "p.sacks5.s2",
      "p.sacks5.s3"
    ],
    "pricing": null
  },
  {
    "slug": "aluminium",
    "key": "p.alu",
    "cat": "plastic",
    "industries": ["food"],
    "types": ["zipper-pouches"],
    "images": ["/products/aluminium.jpg"],
    "specs": [],
    "pricing": "aluminium"
  },
  {
    "slug": "flyers",
    "key": "p.flyers",
    "cat": "print",
    "industries": ["food", "clothing"],
    "types": ["flyers"],
    "images": ["https://images.unsplash.com/photo-1572950947476-26a6e4111e80?w=1100&q=72&auto=format&fit=crop"],
    "specs": [
      "p.flyers.s1",
      "p.flyers.s2",
      "p.flyers.s3"
    ],
    "pricing": null
  }
];

export interface ClientGroup {
  labelKey: string;
  names: { name: string; sub?: string; logo?: string; darkPlate?: boolean }[];
}

export const CLIENTS: ClientGroup[] = [
  {
    labelKey: "clients.food",
    names: [
      { name: "Haj Arafa", logo: "/clients/haj-arafa.png" },
      { name: "Coca-Cola", logo: "/clients/coca-cola.png" },
      { name: "Gomla Market", logo: "/clients/gomla-market.png" },
      { name: "TASTE PURE", logo: "/clients/taste-pure.png" },
    ],
  },
  {
    labelKey: "clients.cosmetics",
    names: [
      { name: "Parkvilla", logo: "/clients/parkvilla.png" },
      { name: "Capixy", logo: "/clients/capixy.jpg" },
      { name: "Marico", sub: "Fiancée · Hair Code", logo: "/clients/marico.png" },
      { name: "RawAfrica", logo: "/clients/rawafrica.jpg" },
      { name: "FEVELIN", logo: "/clients/fevelin.jpg" },
      { name: "LUNA", logo: "/clients/luna.png" },
      { name: "Willy", logo: "/clients/willy.png" },
      { name: "Joviality", logo: "/clients/joviality.jpg" },
      { name: "Nuit Fragrance", logo: "/clients/nuit.png" },
      { name: "Era Care", logo: "/clients/era-care.png" },
      { name: "SORELLA" },
    ],
  },
  {
    labelKey: "clients.clothing",
    names: [
      { name: "Carina", logo: "/clients/carina.jpg" },
      { name: "DXLR", logo: "/clients/dxlr.png" },
      { name: "SLEEKZ", logo: "/clients/sleekz.png" },
      { name: "FATM" },
      { name: "ELIGHT" },
      { name: "JEANZY", logo: "/clients/jeanzy.svg" },
      { name: "KLEVY", logo: "/clients/klevy.jpg" },
    ],
  },
  {
    labelKey: "clients.appliances",
    names: [
      // Both logos are white-on-transparent — need the dark plate, not the shared white one.
      { name: "Beko", logo: "/clients/beko.png", darkPlate: true },
      { name: "Elaraby Group", logo: "/clients/elaraby.png", darkPlate: true },
    ],
  },
];
