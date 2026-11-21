import Image from "next/image";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import type { CatalogueProduct } from "@/content/products";
import { cn } from "@/lib/utils";

/**
 * A product, the way the homepage shows its range: a square photo on the soft
 * rose ground and the name in the display serif. The whole card links to the
 * product page, where the details live.
 */
// "auto" = compact on phones, large from sm up (matches the catalogue's default grid)
const STYLE = {
  large: {
    frame: "rounded-[20px]",
    title: "mt-4 text-[clamp(1.1rem,1rem+0.4vw,1.35rem)]",
    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  },
  compact: {
    frame: "rounded-[14px]",
    title: "mt-2.5 text-[clamp(0.95rem,0.9rem+0.25vw,1.1rem)]",
    sizes: "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
  },
  auto: {
    frame: "rounded-[14px] sm:rounded-[20px]",
    title: "mt-2.5 text-[clamp(0.95rem,0.9rem+0.25vw,1.1rem)] sm:mt-4 sm:text-[clamp(1.1rem,1rem+0.4vw,1.35rem)]",
    sizes: "(max-width: 1024px) 50vw, 33vw",
  },
} as const;

export function ProductCard({
  product,
  variant = "large",
}: {
  product: CatalogueProduct;
  variant?: keyof typeof STYLE;
}) {
  const t = useTranslations();
  const style = STYLE[variant];

  return (
    <Link id={product.slug} href={`/products/${product.slug}`} className="group block">
      <div className={cn("relative aspect-square overflow-hidden bg-paper-2", style.frame)}>
        <Image
          src={product.images[0]}
          alt=""
          fill
          sizes={style.sizes}
          className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
        />
      </div>
      <h3
        className={cn(
          "text-center font-display text-ink transition-colors group-hover:text-accent",
          style.title,
        )}
      >
        {t(`${product.key}.t`)}
      </h3>
    </Link>
  );
}
