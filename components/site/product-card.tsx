import Image from "next/image";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import type { CatalogueProduct } from "@/content/products";

/**
 * A product, the way the homepage shows its range: a square photo on the soft
 * rose ground and the name in the display serif. The whole card links to the
 * product page, where the details live.
 */
export function ProductCard({ product }: { product: CatalogueProduct }) {
  const t = useTranslations();

  return (
    <Link id={product.slug} href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-[20px] bg-paper-2">
        <Image
          src={product.images[0]}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
        />
      </div>
      <h3 className="mt-4 text-center font-display text-[clamp(1.1rem,1rem+0.4vw,1.35rem)] text-ink transition-colors group-hover:text-accent">
        {t(`${product.key}.t`)}
      </h3>
    </Link>
  );
}
