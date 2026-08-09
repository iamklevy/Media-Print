/** Ported from the static site. Figures verified against
 *  "Price list 2026-3-25.pdf" and cross-checked with the XLSX quote sheet.
 *  All prices EGP per piece, excluding VAT. */

export type PricingModel = 'tiers' | 'finish' | 'perKg';

export interface Variant {
  size: string;
  colour?: string; colourAr?: string;
  label?: string;  labelAr?: string;
  sizeLabel?: string; sizeLabelAr?: string;
  prices?: number[] | Record<string, number>;
  printing?: number;
  moq?: number;
  perKg?: number; pcsPerKg?: number;
}

export interface Finish { id: string; en: string; ar: string }

export interface PricedProduct {
  model: PricingModel;
  tiers?: number[];
  printing?: number;
  printIncluded?: boolean;
  printingPerVariant?: boolean;
  needsReview?: boolean;
  finishes?: Finish[];
  variants: Variant[];
  extra?: Record<string, unknown>;
  moqNote?: string; moqNoteAr?: string;
}

export interface PriceBook {
  currency: string;
  note: string;
  products: Record<string, PricedProduct>;
}

export const PRICING: PriceBook = {
  "currency": "EGP",
  "note": "Prices exclude VAT. One colour, one side unless stated.",
  "products": {
    "corrugated": {
      "model": "tiers",
      "tiers": [
        100,
        200,
        300,
        500,
        1000
      ],
      "printing": 3,
      "variants": [
        {
          "size": "20×20×7",
          "colour": "Brown",
          "colourAr": "بني",
          "prices": [
            14,
            13.5,
            13,
            12,
            10
          ]
        },
        {
          "size": "25×20.5×9",
          "colour": "Brown",
          "colourAr": "بني",
          "prices": [
            19,
            18.5,
            18,
            16.5,
            15
          ]
        },
        {
          "size": "25×30×10",
          "colour": "Brown",
          "colourAr": "بني",
          "prices": [
            21.5,
            21,
            20,
            18.5,
            17
          ],
          "check": true
        },
        {
          "size": "25×30×10",
          "colour": "White",
          "colourAr": "أبيض",
          "prices": [
            26,
            25,
            24,
            23,
            21
          ],
          "check": true
        }
      ],
      "moqNote": "Any size can be made from 1,000 boxes.",
      "moqNoteAr": "متاح تصنيع أي مقاس بداية من 1000 كرتونة."
    },
    "apparel": {
      "model": "tiers",
      "tiers": [
        300,
        500,
        1000
      ],
      "printing": 0,
      "printIncluded": true,
      "variants": [
        {
          "size": "20×25",
          "prices": [
            8,
            7,
            6
          ]
        },
        {
          "size": "27×35",
          "prices": [
            9,
            8,
            7
          ]
        },
        {
          "size": "35×40",
          "prices": [
            10,
            9,
            8
          ]
        },
        {
          "size": "37×45",
          "prices": [
            11,
            10,
            9
          ]
        }
      ],
      "moqNote": "Price includes one-colour printing.",
      "moqNoteAr": "السعر شامل الطباعة لون واحد."
    },
    "nonwoven": {
      "model": "tiers",
      "tiers": [
        300,
        500,
        1000
      ],
      "printingPerVariant": true,
      "variants": [
        {
          "size": "16×22",
          "printing": 1.5,
          "prices": [
            2,
            1.75,
            1.5
          ]
        },
        {
          "size": "20×25",
          "printing": 1.5,
          "prices": [
            3,
            2.75,
            2.5
          ]
        },
        {
          "size": "25×30",
          "printing": 1.5,
          "prices": [
            3.25,
            2.95,
            2.65
          ]
        },
        {
          "size": "30×35",
          "printing": 2,
          "prices": [
            4,
            3.75,
            3.5
          ]
        },
        {
          "size": "30×40",
          "printing": 2,
          "prices": [
            4.25,
            4,
            3.75
          ]
        },
        {
          "size": "35×40",
          "printing": 2,
          "prices": [
            4.75,
            4.5,
            4.25
          ]
        },
        {
          "size": "40×40",
          "printing": 2,
          "prices": [
            5.5,
            5.25,
            4.9
          ]
        },
        {
          "size": "40×45",
          "printing": 2,
          "prices": [
            6.25,
            5.9,
            5.6
          ]
        },
        {
          "size": "45×50",
          "printing": 2.25,
          "prices": [
            6.5,
            6.25,
            6
          ]
        },
        {
          "size": "50×50",
          "printing": 2.25,
          "prices": [
            7.5,
            7.25,
            7
          ]
        },
        {
          "size": "50×60",
          "printing": 2.25,
          "prices": [
            8.25,
            8,
            7.75
          ]
        },
        {
          "size": "60×60",
          "printing": 2.25,
          "prices": [
            9,
            8.6,
            8.3
          ]
        }
      ],
      "moqNote": "All colours available.",
      "moqNoteAr": "متوفر جميع الألوان."
    },
    "paper-bags": {
      "model": "tiers",
      "tiers": [
        300,
        1000
      ],
      "printing": 2.5,
      "variants": [
        {
          "size": "25×30×8",
          "colour": "Brown",
          "colourAr": "بني",
          "prices": [
            7.5,
            6
          ]
        },
        {
          "size": "30×40×10",
          "colour": "Brown",
          "colourAr": "بني",
          "prices": [
            10,
            8
          ]
        }
      ],
      "moqNote": "Any size can be made from 1,000 bags.",
      "moqNoteAr": "متاح تصنيع أي مقاس بداية من 1000 شنطة."
    },
    "tags": {
      "model": "finish",
      "finishes": [
        {
          "id": "rect",
          "en": "Rectangular",
          "ar": "مستطيل"
        },
        {
          "id": "curve",
          "en": "Curved edge",
          "ar": "جناب كيرف"
        },
        {
          "id": "hole",
          "en": "Punched + string",
          "ar": "خرم + حبل"
        },
        {
          "id": "metal",
          "en": "Punched + string + metal",
          "ar": "خرم + حبل + معدن"
        }
      ],
      "variants": [
        {
          "size": "9×5",
          "moq": 300,
          "prices": {
            "rect": 1.8,
            "curve": 2,
            "hole": 2.5,
            "metal": 3.25
          }
        },
        {
          "size": "7×10",
          "moq": 200,
          "prices": {
            "rect": 3,
            "curve": 3.25,
            "hole": 3.75,
            "metal": 4.25
          }
        },
        {
          "size": "10×15",
          "moq": 100,
          "prices": {
            "rect": 5,
            "curve": 5.25,
            "hole": 6,
            "metal": 6.75
          }
        }
      ],
      "extra": {
        "size": "5 cm round",
        "sizeAr": "دائري 5 سم",
        "model": "tiers",
        "tiers": [
          100,
          200,
          300
        ],
        "prices": [
          4,
          3.75,
          3.5
        ],
        "finish": "hole"
      }
    },
    "aluminium": {
      "model": "finish",
      "needsReview": true,
      "finishes": [
        {
          "id": "std",
          "en": "As listed",
          "ar": "حسب الجدول"
        }
      ],
      "variants": [
        {
          "size": "12×16",
          "label": "Printed white",
          "labelAr": "مطبوع أبيض",
          "moq": 4000,
          "prices": {
            "std": 3.75
          }
        },
        {
          "size": "16×24",
          "label": "Printed white",
          "labelAr": "مطبوع أبيض",
          "moq": 2000,
          "prices": {
            "std": 6
          }
        },
        {
          "size": "24×32",
          "label": "Printed white",
          "labelAr": "مطبوع أبيض",
          "moq": 1000,
          "prices": {
            "std": 11
          }
        },
        {
          "size": "32×48",
          "label": "Printed white",
          "labelAr": "مطبوع أبيض",
          "moq": 1000,
          "prices": {
            "std": 20
          }
        },
        {
          "size": "12.5×17.5",
          "label": "Plain",
          "labelAr": "سادة",
          "moq": 400,
          "prices": {
            "std": 3
          }
        },
        {
          "size": "17.5×25",
          "label": "Plain",
          "labelAr": "سادة",
          "moq": 300,
          "prices": {
            "std": 4
          }
        },
        {
          "size": "35×25",
          "label": "Plain",
          "labelAr": "سادة",
          "moq": 200,
          "prices": {
            "std": 6.5
          }
        },
        {
          "size": "35×40",
          "label": "Plain",
          "labelAr": "سادة",
          "moq": 500,
          "prices": {
            "std": 6
          }
        },
        {
          "size": "35×50",
          "label": "Plain",
          "labelAr": "سادة",
          "moq": 500,
          "prices": {
            "std": 9
          }
        }
      ],
      "moqNote": "Three-side seal. Four-colour printing is quoted separately.",
      "moqNoteAr": "تقفيل ثلاث جوانب. طباعة 4 ألوان بتتسعّر على حدة."
    },
    "courier": {
      "model": "perKg",
      "printing": 3,
      "variants": [
        {
          "size": "25×35",
          "colour": "Grey",
          "colourAr": "رمادي",
          "sizeLabel": "Small",
          "sizeLabelAr": "صغير",
          "perKg": 210,
          "pcsPerKg": 68
        },
        {
          "size": "35×40",
          "colour": "Grey",
          "colourAr": "رمادي",
          "sizeLabel": "Medium",
          "sizeLabelAr": "وسط",
          "perKg": 210,
          "pcsPerKg": 47
        },
        {
          "size": "40×50",
          "colour": "Grey",
          "colourAr": "رمادي",
          "sizeLabel": "Large",
          "sizeLabelAr": "كبير",
          "perKg": 210,
          "pcsPerKg": 32
        },
        {
          "size": "35×40",
          "colour": "Black",
          "colourAr": "أسود",
          "sizeLabel": "Medium",
          "sizeLabelAr": "وسط",
          "perKg": 220,
          "pcsPerKg": 50
        },
        {
          "size": "35×40",
          "colour": "Salmon",
          "colourAr": "سيمون",
          "sizeLabel": "Medium",
          "sizeLabelAr": "وسط",
          "perKg": 220,
          "pcsPerKg": 50
        }
      ],
      "moqNote": "Sold by the kilogram. Printing adds EGP 3 per bag.",
      "moqNoteAr": "البيع بالكيلو. الطباعة تضيف 3 جنيهات على الكيس."
    }
  }
} as PriceBook;
