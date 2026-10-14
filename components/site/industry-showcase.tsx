import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import type { Industry } from "@/content/industries";
import { cn } from "@/lib/utils";
import { SnapScroller } from "@/components/site/snap-scroller";

/**
 * "Choose your industry" cards: on phones one swipeable row with dots
 * (SnapScroller), from tablets up a 2-column grid of equal cards. Each card is a photo with a frosted
 * strip carrying the name, blurb, product-type chips and an arrow; the whole
 * card links to that industry's products, the chips to a filtered view.
 */
export function IndustryShowcase({ industries }: { industries: Industry[] }) {
  const t = useTranslations();

  return (
    <SnapScroller
      labels={industries.map((ind) => t("industry.show", { name: t(`${ind.key}.name`) }))}
      gridClassName="sm:grid sm:grid-cols-2"
    >
      {industries.map((ind) => {
        const name = t(`${ind.key}.name`);
        return (
          <div
            key={ind.slug}
            style={ind.backdrop ? { backgroundColor: ind.backdrop } : undefined}
            className="group relative isolate aspect-[4/5] overflow-hidden rounded-[22px] bg-paper-2 after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:border after:border-ink/10 after:content-[''] sm:rounded-[28px] lg:aspect-[16/11]"
          >
            <Image
              src={ind.image}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              // cut-outs: nudge the crop up a little so the top of the product clears the card edge on wide cards
              className={cn(
                "-z-10 object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]",
                ind.backdrop && "object-[50%_40%]",
              )}
            />

            {/* the whole card is the link; the strip's chips sit above it (z-10) */}
            <Link
              href={`/products?industry=${ind.slug}`}
              aria-label={t("industry.view", { name })}
              className="absolute inset-0 rounded-[inherit] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-accent"
            />

            <div className="pointer-events-none absolute inset-x-2 bottom-2 rounded-[16px] border border-white/60 bg-paper/85 p-4 text-ink shadow-[0_10px_30px_-10px_rgb(38_28_18/0.25)] backdrop-blur-xl backdrop-saturate-150 sm:inset-x-3 sm:bottom-3 sm:rounded-[20px] sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-[1.2rem] font-extrabold leading-[1.1] tracking-[-0.02em] sm:text-[1.3rem] lg:text-[1.6rem] rtl:tracking-normal">
                  {name}
                </h3>
                <span
                  aria-hidden
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-white transition-colors group-hover:bg-accent sm:size-10"
                >
                  <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45 rtl:-scale-x-100 rtl:group-hover:-rotate-45 sm:size-5" />
                </span>
              </div>

              <p className="mt-2 line-clamp-3 max-w-[46ch] text-[0.88rem] lg:text-[0.95rem] leading-relaxed text-muted">
                {t(`${ind.key}.blurb`)}
              </p>

              <ul className="pointer-events-auto relative z-10 mt-3 flex flex-wrap gap-1.5">
                {ind.types.map((type) => (
                  <li key={type.labelKey}>
                    <Link
                      href={`/products?industry=${ind.slug}&type=${type.typeSlug}`}
                      className="inline-flex rounded-full border border-line bg-paper px-2.5 py-1 text-[0.78rem] font-semibold transition-colors hover:border-accent hover:text-accent"
                    >
                      {t(type.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </SnapScroller>
  );
}
