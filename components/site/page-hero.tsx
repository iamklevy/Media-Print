import { Wrap } from "./section";
import { HERO_BG } from "./home-hero";

/**
 * Top of every inner page: the homepage hero's pink, a centred display-serif
 * title and at most one short line. Pulled up under the floating header so the
 * pink runs to the top of the screen.
 */
export function PageHero({ title, lead }: { title: string; lead?: string }) {
  return (
    <section
      style={{
        backgroundColor: HERO_BG,
        backgroundImage: `radial-gradient(ellipse 70% 100% at 50% 100%, #fde4de 0%, ${HERO_BG} 55%, #eeb3a7 100%)`,
      }}
      className="-mt-[72px] pb-16 pt-[calc(72px+4rem)] md:pb-20 md:pt-[calc(72px+5.5rem)]"
    >
      <Wrap className="flex flex-col items-center text-center">
        <h1 className="motion-safe:animate-[hero-rise_0.9s_cubic-bezier(0.22,0.61,0.36,1)_both] font-display text-[clamp(2.2rem,1.5rem+3vw,3.6rem)] text-balance text-ink rtl:text-[clamp(2.5rem,1.7rem+3.2vw,4rem)]">
          {title}
        </h1>
        {lead && (
          <p className="motion-safe:animate-[hero-rise_0.9s_cubic-bezier(0.22,0.61,0.36,1)_0.12s_both] mt-4 max-w-[46ch] text-[1rem] leading-relaxed text-[#7a2e3b]/85 text-pretty">
            {lead}
          </p>
        )}
      </Wrap>
    </section>
  );
}
