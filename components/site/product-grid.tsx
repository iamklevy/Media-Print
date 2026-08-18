"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { ProductCard } from "./product-card";
import type { CatalogueProduct } from "@/content/products";
import { INDUSTRIES } from "@/content/industries";
import { cn } from "@/lib/utils";

const INDUSTRY_SLUGS = INDUSTRIES.map((i) => i.slug);

export function ProductGrid({ products }: { products: CatalogueProduct[] }) {
  const t = useTranslations();
  const searchParams = useSearchParams();

  const initialIndustry = searchParams.get("industry");
  const [industry, setIndustry] = useState<string>(
    initialIndustry && INDUSTRY_SLUGS.includes(initialIndustry) ? initialIndustry : "all"
  );
  // A `?type=` link (from the homepage's "Explore our packaging solutions"
  // section) filters by solution type instead, on top of whichever industry
  // tab is selected — "all" by default so the type filter isn't hidden
  // behind an unrelated industry tab.
  const type = searchParams.get("type");

  const shown = products.filter((p) => {
    if (industry !== "all" && !p.industries.includes(industry)) return false;
    if (type && !p.types.includes(type)) return false;
    return true;
  });

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setIndustry("all")}
          className={cn(
            "rounded-full border px-4 py-2 text-[0.92rem] font-semibold transition-all",
            industry === "all" ? "border-ink bg-ink text-paper" : "border-line bg-transparent hover:border-ink"
          )}
        >
          {t("industry.all")}
        </button>
        {INDUSTRIES.map((ind) => (
          <button
            key={ind.slug}
            type="button"
            onClick={() => setIndustry(ind.slug)}
            className={cn(
              "rounded-full border px-4 py-2 text-[0.92rem] font-semibold transition-all",
              industry === ind.slug ? "border-ink bg-ink text-paper" : "border-line bg-transparent hover:border-ink"
            )}
          >
            {t(`${ind.key}.name`)}
          </button>
        ))}
      </div>

      {shown.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      ) : (
        <p className="text-muted">{t("cat.empty")}</p>
      )}
    </>
  );
}
