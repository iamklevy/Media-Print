import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";

import { Link } from "@/i18n/navigation";

const HERO_IMAGE = "/hero/packaging.jpg";

/**
 * The blurred reflection under the hero — a mirrored, blurred copy of the
 * photo, so its colours bleed into the background of the section below (HeroReflection).
 * Tweak these freely: opacity 0 (off) – 1 (full strength), blur in px.
 */
export const HERO_REFLECTION_OPACITY = 0.55;
export const HERO_REFLECTION_BLUR = 80;

/** Only figures that can be checked against the price list. */
const STATS = [
  { value: "13", k: "home.stats.products_n" },
  { value: "300", k: "home.stats.moq_n" },
  { value: "27", k: "home.stats.gov_n" },
];

/**
 * Homepage hero: a full-screen photo the site header floats over (the section
 * pulls itself up under the sticky header — see SiteHeader's overlay mode),
 * with an oversized translucent word, stats and the pricing CTA.
 *
 * Photo: Unsplash (photo-1680034977375), free under the Unsplash License.
 */
export function HomeHero() {
  const t = useTranslations();

  return (
    <section className="relative isolate z-10 -mt-[72px] flex min-h-[max(620px,100svh)] flex-col overflow-hidden bg-ink text-white">
      <Image
        src={HERO_IMAGE}
        alt=""
        fill
        loading="eager"
        fetchPriority="high"
        sizes="100vw"
        className="-z-20 object-cover"
      />
      <span
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(14,11,8,0.72)_0%,rgba(14,11,8,0.3)_32%,rgba(14,11,8,0.4)_58%,rgba(14,11,8,0.8)_100%)]"
      />

      {/* the oversized word, Winzy-style — always one line: the size is the
          viewport width over the word's measured width-to-font-size ratio
          ("MEDIA PRINT" ≈ 5.8em, "ميديا برنت" ≈ 4.2em, plus a little slack) */}
      <p
        aria-hidden
        className="mt-[96px] select-none bg-[linear-gradient(180deg,rgba(255,255,255,0.82)_0%,rgba(255,255,255,0.12)_100%)] bg-clip-text whitespace-nowrap px-4 text-center text-[min(calc((100vw-2rem)/6.1),13rem)] font-extrabold leading-[0.9] tracking-[-0.045em] text-transparent rtl:text-[min(calc((100vw-2rem)/4.4),13rem)] rtl:tracking-normal sm:mt-[120px]"
      >
        {t("hero.v3.word")}
      </p>

      <div className="mx-auto mt-auto w-[min(1200px,100%-2.5rem)] pb-10 pt-12 md:pb-14">
        <dl className="grid max-w-[620px] grid-cols-3 gap-4 border-t border-white/15 pt-6 sm:gap-10 sm:border-0 sm:pt-0">
          {STATS.map(({ value, k }) => (
            <div key={k} className="flex flex-col gap-2">
              <dt className="order-last max-w-[18ch] text-[0.74rem] leading-snug text-white/70 sm:text-[0.9rem]">
                {t(k)}
              </dt>
              <dd className="text-[clamp(1.75rem,1.4rem+2vw,3rem)] font-extrabold leading-none tracking-tight">
                {value}+
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-7">
          <Link
            href="/contact"
            className="group inline-flex w-fit items-center gap-1"
          >
            <span className="rounded-full bg-white px-7 py-3.5 text-[0.98rem] font-bold text-ink transition-colors group-hover:bg-accent group-hover:text-white">
              {t("hero.v2.cta")}
            </span>
            <span className="grid size-[52px] place-items-center rounded-full border-2 border-white bg-transparent text-white transition-colors group-hover:border-accent group-hover:bg-accent">
              <ArrowUpRight className="size-5 rtl:-scale-x-100" />
            </span>
          </Link>
          <div className="order-first max-w-[46ch] sm:order-none">
            <h1 className="text-[1.02rem] font-bold leading-snug text-white">
              {t("hero.v2.h1")}
            </h1>
            <p className="mt-1 text-[0.92rem] leading-relaxed text-white/75">
              {t("hero.v2.lead")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * The hero photo mirrored and blurred, used as the background of the section
 * right under the hero so the photo's colours bleed into it. Drop it in as the
 * first child of a `relative isolate overflow-hidden` section; it sits behind
 * the content (-z-10). Opacity/blur come from the constants at the top.
 */
export function HeroReflection() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[clamp(360px,45vw,640px)] overflow-hidden"
    >
      {/* starts above the layer so the soft blurred top edge stays out of view */}
      <div
        className="absolute inset-x-[-10%] top-[-120px] h-[max(620px,100svh)] -scale-y-100"
        style={{
          opacity: HERO_REFLECTION_OPACITY,
          filter: `blur(${HERO_REFLECTION_BLUR}px) saturate(4)`,  
        }}
      >
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          sizes="50vw"
          className="object-cover"
        />
      </div>
      {/* top: picks up from the hero's bottom shade (0.8) so there is no seam;
          bottom: melts into the section's own ink background */}
      <span className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(14,11,8,0.8)_0%,rgba(14,11,8,0)_30%,rgba(14,11,8,0)_45%,var(--color-ink)_100%)]" />
    </div>
  );
}
