/** Media Print Pack sticker catalogue. price: null renders as "Price on request". */

export interface StickerCategory { id: string; en: string; ar: string }
export interface StickerMaterial { id: string; en: string; ar: string }
export interface StickerItem {
  id: string; cat: string; mat: string; size: string;
  en: string; ar: string;
  price: number | null; moq?: number; img: string | null;
  noteEn?: string; noteAr?: string;
}
export interface StickerOffer { item: string; qty: number; price: number; was?: number }
export interface StickerCatalogue {
  currency: string;
  categories: StickerCategory[];
  materials: StickerMaterial[];
  items: StickerItem[];
  offers: StickerOffer[];
}

export const STICKERS: StickerCatalogue = {
  "currency": "EGP",
  "categories": [
    {
      "id": "food",
      "en": "Food & Sweets",
      "ar": "أغذية وحلويات"
    },
    {
      "id": "cafe",
      "en": "Cafés & Beverage",
      "ar": "كافيهات ومشروبات"
    },
    {
      "id": "cosmetics",
      "en": "Cosmetics & Beauty",
      "ar": "مستحضرات تجميل وعناية"
    },
    {
      "id": "events",
      "en": "Events & Gifting",
      "ar": "مناسبات وهدايا"
    },
    {
      "id": "retail",
      "en": "Retail & Furniture",
      "ar": "تجزئة وأثاث"
    }
  ],
  "materials": [
    {
      "id": "paper",
      "en": "Paper",
      "ar": "ورق"
    },
    {
      "id": "plastic",
      "en": "Plastic",
      "ar": "بلاستيك"
    },
    {
      "id": "transparent",
      "en": "Transparent",
      "ar": "شفاف"
    },
    {
      "id": "gloss",
      "en": "Gloss laminated",
      "ar": "ورق سلوفان لامع"
    },
    {
      "id": "metalize",
      "en": "Metalized",
      "ar": "ميتالايز"
    }
  ],
  "items": [
    {
      "id": "jar-5",
      "cat": "food",
      "mat": "paper",
      "size": "5 × 5",
      "en": "Jar & cheese-box sticker",
      "ar": "استيكر برطمان وعلبة جبن",
      "price": null,
      "img": "https://images.unsplash.com/photo-1702724122836-b3bba37a1303?w=600&q=72&auto=format&fit=crop"
    },
    {
      "id": "pastry-10",
      "cat": "food",
      "mat": "paper",
      "size": "10 × 10",
      "en": "Pastry box sticker",
      "ar": "استيكر علبة معجنات",
      "price": null,
      "img": "https://images.unsplash.com/photo-1702724122836-b3bba37a1303?w=600&q=72&auto=format&fit=crop"
    },
    {
      "id": "cake-4",
      "cat": "food",
      "mat": "paper",
      "size": "4 × 4",
      "en": "Cake box sticker",
      "ar": "استيكر علبة تورت",
      "price": null,
      "img": "https://images.unsplash.com/photo-1702724122836-b3bba37a1303?w=600&q=72&auto=format&fit=crop"
    },
    {
      "id": "meat-5",
      "cat": "food",
      "mat": "plastic",
      "size": "5 × 5",
      "en": "Meat packaging sticker",
      "ar": "استيكر تغليف لحوم",
      "price": null,
      "img": "https://images.unsplash.com/photo-1702724122836-b3bba37a1303?w=600&q=72&auto=format&fit=crop"
    },
    {
      "id": "produce-2",
      "cat": "food",
      "mat": "paper",
      "size": "1.5 × 2",
      "en": "Fruit & vegetable sticker",
      "ar": "استيكر خضار وفاكهة",
      "price": null,
      "img": "https://images.unsplash.com/photo-1702724122836-b3bba37a1303?w=600&q=72&auto=format&fit=crop"
    },
    {
      "id": "cup-5",
      "cat": "cafe",
      "mat": "paper",
      "size": "5 × 5",
      "en": "Coffee cup sticker",
      "ar": "استيكر كوب قهوة",
      "price": null,
      "img": "https://images.unsplash.com/photo-1574585046455-827418063fc1?w=600&q=72&auto=format&fit=crop"
    },
    {
      "id": "cup-clear",
      "cat": "cafe",
      "mat": "transparent",
      "size": "6 × 6",
      "en": "Transparent café sticker",
      "ar": "استيكر كافيه شفاف",
      "price": null,
      "img": "https://images.unsplash.com/photo-1574585046455-827418063fc1?w=600&q=72&auto=format&fit=crop"
    },
    {
      "id": "coffee-bag",
      "cat": "cafe",
      "mat": "paper",
      "size": "10 × 8",
      "en": "Coffee bag sticker",
      "ar": "استيكر كيس بن",
      "price": null,
      "img": "https://images.unsplash.com/photo-1574585046455-827418063fc1?w=600&q=72&auto=format&fit=crop"
    },
    {
      "id": "cream-jar",
      "cat": "cosmetics",
      "mat": "plastic",
      "size": "4 × 13.5",
      "en": "Cream jar wrap",
      "ar": "استيكر برطمان كريم",
      "price": null,
      "img": "https://images.unsplash.com/photo-1706111584162-416d0f49748a?w=600&q=72&auto=format&fit=crop"
    },
    {
      "id": "perfume",
      "cat": "cosmetics",
      "mat": "plastic",
      "size": "4 × 2",
      "en": "Perfume bottle sticker",
      "ar": "استيكر زجاجة عطر",
      "price": null,
      "img": "https://images.unsplash.com/photo-1706111584162-416d0f49748a?w=600&q=72&auto=format&fit=crop"
    },
    {
      "id": "splash",
      "cat": "cosmetics",
      "mat": "plastic",
      "size": "8 × 11",
      "en": "Body splash label",
      "ar": "ليبل بودي سبلاش",
      "price": null,
      "img": "https://images.unsplash.com/photo-1706111584162-416d0f49748a?w=600&q=72&auto=format&fit=crop"
    },
    {
      "id": "tube-label",
      "cat": "cosmetics",
      "mat": "gloss",
      "size": "2.5 × 14",
      "en": "Tube & bottle label",
      "ar": "ليبل تيوب وزجاجة",
      "price": null,
      "img": "https://images.unsplash.com/photo-1706111584162-416d0f49748a?w=600&q=72&auto=format&fit=crop"
    },
    {
      "id": "baby-6",
      "cat": "events",
      "mat": "paper",
      "size": "6 × 6",
      "en": "Celebration sticker",
      "ar": "استيكر مناسبات",
      "price": null,
      "img": "https://images.unsplash.com/photo-1638560927109-062a7e7bdf03?w=600&q=72&auto=format&fit=crop"
    },
    {
      "id": "bouquet-3",
      "cat": "events",
      "mat": "paper",
      "size": "3 × 3",
      "en": "Flower bouquet sticker",
      "ar": "استيكر بوكيه ورد",
      "price": null,
      "img": "https://images.unsplash.com/photo-1638560927109-062a7e7bdf03?w=600&q=72&auto=format&fit=crop"
    },
    {
      "id": "round-8",
      "cat": "retail",
      "mat": "paper",
      "size": "8 × 8",
      "en": "Round paper sticker",
      "ar": "استيكر ورق دائري",
      "price": null,
      "img": "https://images.unsplash.com/photo-1540908187087-eeabb5040af5?w=600&q=72&auto=format&fit=crop"
    },
    {
      "id": "furniture-6",
      "cat": "retail",
      "mat": "paper",
      "size": "6 × 6",
      "en": "Furniture sticker",
      "ar": "استيكر أثاث",
      "price": null,
      "img": "https://images.unsplash.com/photo-1540908187087-eeabb5040af5?w=600&q=72&auto=format&fit=crop"
    },
    {
      "id": "metalize",
      "cat": "retail",
      "mat": "metalize",
      "size": "35 × 40",
      "en": "Metalized sticker",
      "ar": "استيكر ميتالايز",
      "price": 15,
      "moq": 500,
      "img": "https://images.unsplash.com/photo-1540908187087-eeabb5040af5?w=600&q=72&auto=format&fit=crop",
      "noteEn": "One colour, one side. White, black or pink.",
      "noteAr": "لون واحد وش واحد. أبيض أو أسود أو بينك."
    }
  ],
  "offers": []
};
