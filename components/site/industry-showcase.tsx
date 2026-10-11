"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import type { Industry } from "@/content/industries";
import { cn } from "@/lib/utils";

/**
 * Split showcase: industry list on one side, a detail panel (photo, blurb and
 * the product types that industry uses) on the other. Hover/focus/tap picks an
 * industry; on mobile the list collapses to a scrolling row of pills.
 */
export function IndustryShowcase({ industries }: { industries: Industry[] }) {
  const t = useTranslations();
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const current = industries[active];
  const name = t(`${current.key}.name`);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10">
      {/* picker — pills on mobile, a numbered list on desktop */}
      <div
        role="tablist"
        aria-label={t("industry.pick")}
        className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {industries.map((ind, i) => {
          const selected = i === active;
          return (
            <button
              key={ind.slug}
              type="button"
              role="tab"
              id={`industry-tab-${ind.slug}`}
              aria-selected={selected}
              aria-controls="industry-panel"
              onClick={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              className={cn(
                "group shrink-0 rounded-full border px-4 py-2 text-[0.92rem] font-semibold transition-all",
                "lg:flex lg:items-center lg:gap-5 lg:rounded-none lg:border-0 lg:border-b lg:border-line lg:px-1 lg:py-6 lg:text-start lg:first:border-t",
                selected
                  ? "border-ink bg-ink text-paper lg:bg-transparent lg:text-ink"
                  : "border-line text-ink hover:border-ink lg:text-muted lg:hover:text-ink"
              )}
            >
              <span className="lg:flex-1 lg:text-[clamp(1.2rem,1rem+0.7vw,1.55rem)] lg:font-bold">
                {t(`${ind.key}.name`)}
              </span>
              <ArrowRight
                className={cn(
                  "hidden size-5 transition-all rtl:rotate-180 lg:block",
                  selected ? "translate-x-0 text-accent opacity-100" : "-translate-x-2 opacity-0 rtl:translate-x-2"
                )}
              />
            </button>
          );
        })}
      </div>

      {/* detail panel */}
      <div
        id="industry-panel"
        role="tabpanel"
        aria-labelledby={`industry-tab-${current.slug}`}
        className="overflow-hidden rounded-[28px] bg-paper-2 shadow-soft"
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          {/* every photo stays mounted so switching is an instant crossfade */}
          {industries.map((ind, i) => (
            <Image
              key={ind.slug}
              src={ind.image}
              alt={i === active ? t(`${ind.key}.name`) : ""}
              fill
              sizes="(max-width: 1024px) 100vw, 58vw"
              className={cn(
                "object-cover transition-[opacity,transform] duration-700",
                i === active ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"
              )}
            />
          ))}
        </div>

        <div className="p-6 md:p-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current.slug}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <h3 className="text-[clamp(1.3rem,1.05rem+0.8vw,1.6rem)]">{name}</h3>
              <p className="mt-2 max-w-[52ch] leading-relaxed text-muted">{t(`${current.key}.blurb`)}</p>

              <ul className="mt-5 flex flex-wrap gap-2">
                {current.types.map((type) => (
                  <li key={type.labelKey}>
                    <Link
                      href={`/products?industry=${current.slug}&type=${type.typeSlug}`}
                      className="inline-flex rounded-full border border-line bg-paper px-3.5 py-1.5 text-[0.88rem] font-semibold transition-colors hover:border-accent hover:text-accent"
                    >
                      {t(type.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>

              <Link
                href={`/products?industry=${current.slug}`}
                className="group mt-6 inline-flex items-center gap-1.5 font-semibold text-accent transition-all hover:gap-2.5"
              >
                {t("industry.view", { name })}
                <ArrowRight className="size-4 rtl:rotate-180" />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
