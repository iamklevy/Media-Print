export interface CatalogueProduct {
  slug: string;
  /** i18n key prefix, e.g. "p.zipper" -> p.zipper.t / .d / .s1 */
  key: string;
  cat: "plastic" | "paper" | "fabric" | "print";
  img: string;
  specs: string[];
  /** key into PRICING.products, or null when we have no verified prices */
  pricing: string | null;
}

export const PRODUCTS: CatalogueProduct[] = [
  {
    "slug": "zipper",
    "key": "p.zipper",
    "cat": "plastic",
    "img": "https://mediaprint-eg.com/wp-content/uploads/2022/03/1.jpg",
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
    "img": "https://mediaprint-eg.com/wp-content/uploads/2024/06/mmm.jpeg",
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
    "img": "/products/apparel.jpg",
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
    "img": "https://mediaprint-eg.com/wp-content/uploads/2023/05/%D8%B4%D9%86%D8%B7-%D9%82%D9%85%D8%A7%D8%B4.jpg",
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
    "img": "https://mediaprint-eg.com/wp-content/uploads/2023/05/Screen-Shot-2023-05-03-at-10.56.35-AM.png",
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
    "img": "https://mediaprint-eg.com/wp-content/uploads/2022/03/4.jpg",
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
    "img": "https://mediaprint-eg.com/wp-content/uploads/2024/06/Bath-Shower-Just-Gentle-Organic.jpeg",
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
    "img": "/products/cartons.jpg",
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
    "img": "https://mediaprint-eg.com/wp-content/uploads/2022/03/1.jpeg",
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
    "img": "https://mediaprint-eg.com/wp-content/uploads/2024/06/50-%D1%88%D1%82_-%D0%BF%D0%BE%D0%B4%D0%B0%D1%80%D0%BE%D1%87%D0%BD%D1%8B%D0%B5-%D0%BA%D0%BE%D1%80%D0%BE%D0%B1%D0%BA%D0%B8-%D0%B8%D0%B7-%D0%BA%D1%80%D0%B0%D1%84%D1%82-%D0%B1%D1%83%D0%BC%D0%B0%D0%B3%D0%B8-%D0%B4%D0%BB%D1%8F-%D1%83%D0%BA%D1%80%D0%B0%D1%88%D0%B5%D0%BD%D0%B8%D0%B9-_-%D0%94%D0%BE%D0%BC-%D0%B8-%D1%81%D0%B0%D0%B4-_-%D0%90%D0%BB%D0%B8%D0%AD%D0%BA%D1%81%D0%BF%D1%80%D0%B5%D1%81%D1%81.jpeg",
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
    "img": "https://mediaprint-eg.com/wp-content/uploads/2024/06/Main_2024_3.jpg",
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
    "img": "/products/aluminium.jpg",
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
