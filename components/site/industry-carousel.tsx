"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import type { Industry } from "@/content/industries";
import { HoverLift } from "@/components/site/motion";
import { cn } from "@/lib/utils";

/**
 * Grid on tablet+; a dotted, snap-scrolling horizontal carousel on mobile so
 * every industry card gets full width without stacking the page too tall.
 */
export function IndustryCarousel({ industries }: { industries: Industry[] }) {
  const t = useTranslations();
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function handleScroll() {
    const el = trackRef.current;
    if (!el) return;
    const cardWidth = el.scrollWidth / industries.length;
    setActive(Math.min(industries.length - 1, Math.round(el.scrollLeft / cardWidth)));
  }

  function scrollToIndex(i: number) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: (el.scrollWidth / industries.length) * i, behavior: "smooth" });
  }

  return (
    <div>
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden"
      >
        {industries.map((ind) => (
          <HoverLift key={ind.slug} className="w-[85%] shrink-0 snap-center sm:w-auto sm:shrink">
            <Link
              href={`/products?industry=${ind.slug}`}
              className="group relative isolate flex min-h-[280px] flex-col justify-end overflow-hidden rounded-[28px] p-7 shadow-soft transition-shadow duration-500 hover:shadow-deep md:p-8"
            >
              <Image
                src={ind.image}
                alt=""
                fill
                sizes="(max-width: 640px) 85vw, (max-width: 768px) 100vw, 50vw"
                className="-z-20 object-cover transition-transform duration-[1200ms] group-hover:scale-105"
              />
              <span
                aria-hidden
                className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(18,15,12,0.15)_0%,rgba(18,15,12,0.55)_55%,rgba(18,15,12,0.92)_100%)]"
              />
              <h3 className="text-[clamp(1.3rem,1.05rem+0.8vw,1.6rem)] text-paper">{t(`${ind.key}.name`)}</h3>
              <p className="mt-2 max-w-[38ch] text-[0.92rem] leading-relaxed text-paper/78">{t(`${ind.key}.blurb`)}</p>
              <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/12 px-3.5 py-1.5 text-[0.85rem] font-semibold text-paper backdrop-blur-sm transition-all group-hover:gap-2.5 group-hover:bg-white/20">
                {t("cta.products")}
                <ArrowRight className="size-3.5 rtl:rotate-180" />
              </span>
            </Link>
          </HoverLift>
        ))}
      </div>

      <div className="mt-4 flex justify-center gap-2 sm:hidden">
        {industries.map((ind, i) => (
          <button
            key={ind.slug}
            type="button"
            aria-label={`Go to ${t(`${ind.key}.name`)}`}
            onClick={() => scrollToIndex(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              active === i ? "w-5 bg-accent" : "w-1.5 bg-line"
            )}
          />
        ))}
      </div>
    </div>
  );
}
