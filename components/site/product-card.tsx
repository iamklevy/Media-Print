import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import type { CatalogueProduct } from "@/content/products";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  rank,
  showSpecs = true,
}: {
  product: CatalogueProduct;
  rank?: number;
  showSpecs?: boolean;
}) {
  const t = useTranslations();
  const catKey = `cat.${product.cat === "print" ? "print" : product.cat}`;

  return (
    <article
      id={product.slug}
      className="group flex flex-col overflow-hidden rounded-card border border-line bg-paper transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-paper-2">
        <Image
          src={product.images[0]}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {rank && (
          <span className="absolute end-3 top-3 z-10 grid size-8 place-items-center rounded-full bg-accent text-[0.82rem] font-extrabold text-white shadow-soft">
            {rank}
          </span>
        )}
        <span className="absolute start-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-[0.74rem] font-bold text-paper backdrop-blur-sm">
          {t(catKey)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-5 pb-6 pt-5">
        <h3 className="text-[clamp(1.15rem,1rem+0.6vw,1.4rem)]">
          <Link href={`/products/${product.slug}`} className="hover:text-accent-2">
            {t(`${product.key}.t`)}
          </Link>
        </h3>
        <p className="text-[0.93rem] leading-relaxed text-muted">{t(`${product.key}.d`)}</p>

        {showSpecs && product.specs.length > 0 && (
          <ul className="mt-1 grid gap-1.5">
            {product.specs.map((s) => (
              <li key={s} className="flex gap-2 text-[0.86rem] text-ink-2">
                <span className="text-accent">—</span>
                {t(s)}
              </li>
            ))}
          </ul>
        )}

        <div className={cn("mt-auto pt-4")}>
          <Link
            href={`/products/${product.slug}`}
            className="inline-flex items-center gap-1.5 text-[0.95rem] font-semibold text-accent-2 hover:gap-2.5"
          >
            {t("cta.details")}
            <ArrowRight className="size-4 transition-all rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </article>
  );
}
