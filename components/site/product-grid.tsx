"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { ProductCard } from "./product-card";
import type { CatalogueProduct } from "@/content/products";
import { cn } from "@/lib/utils";

const CATS = ["all", "plastic", "paper", "fabric", "print"] as const;

export function ProductGrid({ products }: { products: CatalogueProduct[] }) {
  const t = useTranslations();
  const [cat, setCat] = useState<string>("all");

  const shown = cat === "all" ? products : products.filter((p) => p.cat === cat);

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-2">
        {CATS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={cn(
              "rounded-full border px-4 py-2 text-[0.92rem] font-semibold transition-all",
              cat === c
                ? "border-ink bg-ink text-paper"
                : "border-line bg-transparent hover:border-ink",
            )}
          >
            {t(`cat.${c}`)}
          </button>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </>
  );
}
