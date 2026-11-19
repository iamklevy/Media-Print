import Image from "next/image";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";


/** Nuit perfume-oil boxes on pink, cropped tight around the four boxes (original: nuit-hero-16x9-centered). */
const HERO_IMAGE = "/hero/hero-nuit-boxes.png";


/**
 * The hero photo is light (pastel boxes on pink), so the site header shows its
 * regular frosted capsule over it instead of the white "on dark" overlay.
 * Flip back to true if the hero ever goes back to a dark photo.
 */
export const HOME_HERO_ON_DARK = false;

/** Sampled from the photo's plain backdrop, so the section and the image meet without a seam. */
const HERO_BG = "#f8cfc7";

/**
 * Homepage hero: headline, line and buttons on the plain pink at the top, the
 * photo of the four boxes below as the centrepiece. The header floats over the
 * top (the section pulls itself up under it with -mt-[72px]).
 */
export function HomeHero() {
  const t = useTranslations();

  return (
    <section
      style={{
        backgroundColor: HERO_BG,
        // stage vignette: brighter in the middle where the boxes stand, a
        // slightly deeper rose toward the edges and corners
        backgroundImage: `radial-gradient(ellipse 70% 75% at 50% 62%, #fde4de 0%, ${HERO_BG} 45%, #eeb3a7 100%)`,
      }}
      className="relative isolate z-10 -mt-[72px] flex flex-col overflow-hidden text-ink sm:min-h-[max(680px,100svh)]"
    >
      <div className="relative z-10 mx-auto flex w-[min(880px,100%-2.5rem)] flex-col items-center pt-[calc(72px+2.75rem)] text-center sm:pt-[calc(72px+4rem)]">
        <h1
          className={`motion-safe:animate-[hero-rise_0.9s_cubic-bezier(0.22,0.61,0.36,1)_both] font-display text-[clamp(1.9rem,1.45rem+2.2vw,3.25rem)] rtl:text-[clamp(2.2rem,1.7rem+2.4vw,3.6rem)] text-white [text-shadow:0_1px_2px_rgba(122,46,59,0.28)] text-balance`}
        >
          {t("hero.v2.h1")}
        </h1>
        <p className="motion-safe:animate-[hero-rise_0.9s_cubic-bezier(0.22,0.61,0.36,1)_0.12s_both] mt-3.5 text-[clamp(0.84rem,0.8rem+0.15vw,0.92rem)] leading-relaxed text-[#7a2e3b]/85 text-pretty sm:whitespace-nowrap">
          {t("hero.v2.lead")}
        </p>

        <div className="motion-safe:animate-[hero-rise_0.9s_cubic-bezier(0.22,0.61,0.36,1)_0.24s_both] mt-7 grid grid-cols-2 gap-3">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-full border border-transparent bg-[#8b3343] px-5 py-2.5 text-[0.85rem] font-semibold text-white shadow-[0_8px_24px_-10px_rgba(139,51,67,0.6)] transition-colors hover:bg-[#a33e51]"
          >
            {t("hero.v2.cta")}
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-full border border-ink/15 bg-white/45 px-5 py-2.5 text-[0.85rem] font-semibold text-ink backdrop-blur-md transition-colors hover:border-ink/30 hover:bg-white/70"
          >
            {t("hero.v2.cta2")}
          </Link>
        </div>
      </div>

      {/* the boxes. The file is cropped tight around them (1995x850), so the
          photo can be sized to the space left under the text.
          Phones: a 4:3 frame, bottom-aligned, which shows all four boxes edge to edge.
          Larger screens: a frame with the photo's own shape, as tall as the space
          allows (capped so the boxes never outgrow the window width), with its
          left/right edges faded into HERO_BG so the photo dissolves into the section. */}
      <div className="motion-safe:animate-[hero-stage_1.2s_cubic-bezier(0.22,0.61,0.36,1)_0.3s_both] relative mt-4 aspect-[4/3] w-full [mask-image:linear-gradient(to_bottom,transparent,black_14%)] sm:mt-6 sm:aspect-auto sm:min-h-[400px] sm:flex-1 sm:[mask-image:linear-gradient(to_bottom,transparent,black_10%)]">
        <div className="absolute inset-0 sm:inset-auto sm:bottom-0 sm:left-1/2 sm:aspect-[1995/850] sm:h-full sm:max-h-[calc(160vw*850/1995)] sm:-translate-x-1/2 sm:[mask-image:linear-gradient(to_right,transparent,black_22%,black_78%,transparent)]">
          <Image
            src={HERO_IMAGE}
            alt=""
            fill
            sizes="(max-width: 639px) 190vw, 160vw"
            loading="eager"
            fetchPriority="high"
            className="object-cover object-bottom saturate-[1.12] contrast-[1.05]"
          />
        </div>

        {/* ---- stage lighting, all decorative and click-through ---- */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {/* back glow: a warm halo behind the row that lifts the boxes off the wall */}
          <span className="absolute left-1/2 top-[48%] h-[70%] w-[min(760px,90%)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,244,236,0.55),transparent)] mix-blend-soft-light blur-2xl" />
          {/* floor pool: where the light lands under the boxes */}
          <span className="absolute bottom-[2%] left-1/2 h-[22%] w-[min(820px,95%)] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(255,255,255,0.7),transparent)] mix-blend-soft-light blur-xl" />
        </div>
      </div>

      {/* soft rose vignette multiplied over everything (photo included), under the
          text: a tonal glow toward the edges, clear in the middle where the boxes are. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_110%_70%_at_50%_64%,transparent_45%,rgba(226,140,124,0.22)_85%,rgba(214,118,104,0.32)_100%)] sm:bg-[radial-gradient(ellipse_68%_72%_at_50%_62%,transparent_38%,rgba(226,140,124,0.24)_80%,rgba(214,118,104,0.36)_100%)] mix-blend-multiply"
      />
    </section>
  );
}

/**
 * Background for the dark section right under the hero: a soft rose glow at its
 * top edge that fades into ink, so the pink hero hands over to the dark section
 * like light falling off rather than a hard cut. Drop it in as the first child
 * of a `relative isolate overflow-hidden` section; it sits behind the content.
 */
export function HeroAfterglow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[clamp(320px,40vw,560px)] bg-[radial-gradient(ellipse_75%_100%_at_50%_0%,rgba(214,118,104,0.32),rgba(122,46,59,0.14)_45%,transparent_80%)]"
    />
  );
}
