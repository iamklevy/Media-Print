export interface CatalogueProduct {
  slug: string;
  /** i18n key prefix, e.g. "p.zipper" -> p.zipper.t / .d / .s1 */
  key: string;
  cat: "plastic" | "paper" | "fabric" | "print";
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
    "images": ["/products/aluminium.jpg"],
    "specs": [],
    "pricing": "aluminium"
  }
];

export interface ClientGroup { labelKey: string; names: { name: string; sub?: string }[] }

export const CLIENTS: ClientGroup[] = [
  {
    "labelKey": "clients.food",
    "names": [
      {
        "name": "Haj Arafa"
      },
      {
        "name": "Coca-Cola"
      },
      {
        "name": "Gomla Market"
      },
      {
        "name": "TASTE PURE"
      }
    ]
  },
  {
    "labelKey": "clients.cosmetics",
    "names": [
      {
        "name": "Parkvilla"
      },
      {
        "name": "Capixy"
      },
      {
        "name": "Marico",
        "sub": "Fiancée · Hair Code"
      },
      {
        "name": "RawAfrica"
      },
      {
        "name": "FEVELIN"
      },
      {
        "name": "LUNA"
      },
      {
        "name": "Willy"
      },
      {
        "name": "Joviality"
      },
      {
        "name": "Nuit Fragrance"
      },
      {
        "name": "Era Care"
      },
      {
        "name": "SORELLA"
      }
    ]
  },
  {
    "labelKey": "clients.clothing",
    "names": [
      {
        "name": "Carina"
      },
      {
        "name": "DXLR"
      },
      {
        "name": "SLEEKZ"
      },
      {
        "name": "FATM"
      },
      {
        "name": "ELIGHT"
      },
      {
        "name": "JEANZY"
      },
      {
        "name": "KLEVY"
      }
    ]
  }
];
