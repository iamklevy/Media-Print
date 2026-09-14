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
    "images": ["/products/zipper-loops-travel-bottle-ziplock.jpg"],
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
    "images": [
      "/products/apparel-monest-london-grey-ziplock.jpg",
      "/products/apparel-pilot-gold-foil-ziplock.jpg",
      "/products/apparel-smart-outlet-clear-ziplock.png",
      "/products/apparel-black-typographic-shirt-bag.jpg",
      "/products/apparel-black-gold-ziplock-fatem-hijab.jpg",
    ],
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
    "images": ["/products/courier-lanelle-navy-poly-mailer.jpg"],
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
    "images": [
      "/products/paper-bags-biomedica-teal-flat.jpg",
      "/products/paper-bags-nuit-cream-coated.jpg",
      "/products/paper-bags-favelin-pink-ribbon-pair.jpg",
      "/products/paper-bags-biomedica-teal-rope-angle.jpg",
      "/products/paper-bags-elshobaki-kraft-herb-bag.jpg",
    ],
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
    "images": [
      "/products/stickers-clear-label-roll-pair.jpg",
      "/products/stickers-bafi-care-bottle-label.jpg",
      "/products/stickers-eternelle-cleansing-gel-label.jpg",
      "/products/stickers-dhabia-jojoba-oil-label-pair.jpg",
      "/products/stickers-organic-mango-juice-label.jpg",
      "/products/stickers-aljabal-olive-oil-top-view.jpeg",
      "/products/industry-food-aljabal-olive-oil-bottles.jpg",
      "/products/stickers-dhabia-black-seed-oil-label.jpeg",
      "/products/stickers-dhabia-jojoba-oil-angled.jpeg",
      "/products/stickers-aljabal-spice-jar-lineup.png",
      "/products/stickers-muscle-show-mass-gainer-label.png",
      "/products/stickers-mega-power-whey-black-label.png",
      "/products/stickers-muscle-show-whey-green-label.png",
      "/products/stickers-pickles-sizzle-oil-label-pair.png",
    ],
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
    "industries": ["cosmetics", "clothing", "food"],
    "types": ["boxes"],
    "images": [
      "/products/cartons-smile-wonders-mouthwash-trio.jpg",
      "/products/cartons-luvira-serum-box-unfolded.png",
      "/products/cartons-luvira-serum-box-tilted-open.png",
      "/products/cartons-luvira-serum-box-front.png",
      "/products/cartons-raw-african-brow-serum-box.png",
      "/products/cartons-raw-african-frizzfade-box-front.png",
      "/products/cartons-raw-african-frizzfade-box-side.png",
      "/products/cartons-raw-african-frizzfade-box-back.png",
      "/products/cartons-musk-altahara-lavender-box.png",
      "/products/cartons-musk-altahara-emblem-closeup.png",
      "/products/cartons-kemet-kunafa-chocolate-box.jpg",
      "/products/cartons-nutriville-melatonin-box.png",
      "/products/cartons-luvira-whitening-cream-side.png",
      "/products/cartons-ema-beauty-deodorant-box.png",
      "/products/cartons-tersus-facial-serum-box.png",
      "/products/cartons-bobai-sunscreen-box.png",
      "/products/cartons-smile-wonders-mouthwash-bottle-box.png",
      "/products/cartons-nuit-perfume-box-bottle.png",
      "/products/cartons-franklin-boutique-floral-box.png",
      "/products/cartons-nuit-perfume-oil-pastel-lineup.png",
      "/products/cartons-utopielle-serum-box-gold.png",
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
    "images": [
      "/products/tags-nasaq-women-hang-tag.jpg",
      "/products/tags-carakiri-crafts-round-tag.jpg",
      "/products/tags-arena-for-love-floral-tag.jpg",
    ],
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
    "images": [
      "/products/corrugated-nuit-mailer-box-open-perfume.jpg",
      "/products/corrugated-antidote-shoe-kit-box-pair.jpg",
    ],
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
    "images": ["https://images.unsplash.com/photo-1708746333892-f01eee85b7a4?w=1100&q=72&auto=format&fit=crop"],
    "specs": [],
    "pricing": "aluminium"
  },
  {
    "slug": "flyers",
    "key": "p.flyers",
    "cat": "print",
    "industries": ["food", "clothing"],
    "types": ["flyers"],
    "images": [
      "/products/flyers-nounas-bakery-iced-coffee.jpg",
      "/products/flyers-nounas-bakery-cookie.jpg",
      "/products/flyers-nounas-bakery-flatbread.jpg",
    ],
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
      { name: "Fridal", logo: "/clients/frida.png", darkPlate: true },
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
      { name: "SORELLA", logo: "/clients/sorella.png" },
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
