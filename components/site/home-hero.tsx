import Image, { getImageProps } from "next/image";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";

import { Link } from "@/i18n/navigation";

const HERO_IMAGE = "/hero/hero_nologo.png";
/**
 * Phones get their own portrait version, swapped in via <picture>: the same
 * products, cut from the desktop photo and re-staged on a three-step podium
 * (bags on top, boxes in the middle, Ropel + bottles in front) so every one
 * stays visible. Products fill the top ~60%; the bottom is floor for the text.
 */
const HERO_IMAGE_MOBILE = "/hero/hero_mobile_podium.jpg";
const MOBILE_MEDIA = "(max-width: 639px)";

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
 * with stats and the pricing CTA.
 */
export function HomeHero() {
  const t = useTranslations();

  const common = { alt: "", fill: true, sizes: "100vw", loading: "eager", fetchPriority: "high" } as const;
  const { props: desktop } = getImageProps({ ...common, src: HERO_IMAGE });
  const {
    props: { srcSet: mobileSrcSet },
  } = getImageProps({ ...common, src: HERO_IMAGE_MOBILE });

  return (
    <section className="relative isolate z-10 -mt-[72px] flex min-h-[max(620px,100svh)] flex-col overflow-hidden bg-ink text-white">
      <picture>
        <source media={MOBILE_MEDIA} srcSet={mobileSrcSet} sizes="100vw" />
        {/* eslint-disable-next-line jsx-a11y/alt-text -- decorative; alt="" comes from getImageProps */}
        <img {...desktop} className="-z-20 object-cover object-top sm:object-center" />
      </picture>
      {/* dims the photo so the white text and buttons read cleanly; on phones
          the text sits over the image's plain floor, so the bottom goes darker */}
      <span
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(14,11,8,0.7)_0%,rgba(14,11,8,0.38)_22%,rgba(14,11,8,0.42)_52%,rgba(14,11,8,0.86)_70%,rgba(14,11,8,0.94)_100%)] sm:bg-[linear-gradient(180deg,rgba(14,11,8,0.74)_0%,rgba(14,11,8,0.45)_32%,rgba(14,11,8,0.55)_58%,rgba(14,11,8,0.88)_100%)]"
      />
      {/* desktop: the stats/CTA sit bottom-left over busy product shots — a soft shade just there */}
      <span
        aria-hidden
        className="absolute inset-0 -z-10 hidden bg-[radial-gradient(ellipse_70%_60%_at_18%_88%,rgba(14,11,8,0.6),transparent_70%)] rtl:bg-[radial-gradient(ellipse_70%_60%_at_82%_88%,rgba(14,11,8,0.6),transparent_70%)] sm:block"
      />

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
      // faded to fully transparent before its bottom edge: a hard clip there can
      // render as a light hairline on high-DPR phones (it lands between logo rows)
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[clamp(360px,45vw,640px)] overflow-hidden [mask-image:linear-gradient(to_bottom,black_70%,transparent_96%)]"
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
          // blurred to mush anyway; a distinct quality also gives it a different
          // URL from the hero's, so Next's dev LCP check doesn't mistake this
          // lazy copy for the (eager) hero image
          quality={40}
          className="object-cover"
        />
      </div>
      {/* top: picks up from the hero's bottom shade (0.8) so there is no seam;
          bottom: melts into the section's own ink background */}
      <span className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(14,11,8,0.8)_0%,rgba(14,11,8,0)_30%,rgba(14,11,8,0)_45%,var(--color-ink)_100%)]" />
    </div>
  );
}
