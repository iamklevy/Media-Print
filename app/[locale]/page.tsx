import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";

import { SOLUTION_TYPES } from "@/content/industries";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Wrap } from "@/components/site/section";
import { HomeHero, HeroAfterglow } from "@/components/site/home-hero";
import { ClientMarquee } from "@/components/site/client-marquee";
import { CtaBand } from "@/components/site/cta-band";
import { btnQuiet } from "@/components/site/buttons";
import { Reveal } from "@/components/site/motion";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/*
 * The homepage below the hero carries the hero's mood: warm cream and soft rose
 * grounds, the display serif for titles, the berry from the hero CTA for actions,
 * lots of air, and nothing moving except a gentle fade-in as each part arrives.
 */
const CREAM = "#fdf8f4";
const ROSE = "#f9ebe6";
/** Testimonials: quote/name/role live in messages under home.voices.list.<id>. */
const VOICES = [
  { id: "carina", logo: "/clients/carina.png" },
  { id: "joviality", logo: "/clients/joviality.png" },
  { id: "hajarafa", logo: "/clients/haj-arafa.png" },
] as const;

const STEPS = [1, 2, 3] as const;

function Block({
  bg,
  className,
  children,
}: {
  bg?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section style={bg ? { backgroundColor: bg } : undefined} className={cn("py-20 md:py-28 lg:py-32", className)}>
      <Wrap>{children}</Wrap>
    </section>
  );
}

function Title({ children, onInk }: { children: React.ReactNode; onInk?: boolean }) {
  return (
    <Reveal y={16}>
      <h2
        className={cn(
          "mx-auto mb-12 max-w-[24ch] text-center font-display text-[clamp(1.85rem,1.3rem+2.2vw,2.9rem)] text-balance md:mb-16 rtl:text-[clamp(2.1rem,1.5rem+2.4vw,3.2rem)]",
          onInk ? "text-paper" : "text-ink",
        )}
      >
        {children}
      </h2>
    </Reveal>
  );
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <>
      <HomeHero />

      {/* ---- who prints with us: one calm row of logos on the dark band */}
      <section className="relative isolate overflow-hidden bg-ink py-20 text-paper md:py-28">
        {/* a rose glow at its top picks up from the pink hero */}
        <HeroAfterglow />
        <Wrap>
          <Title onInk>{t("home.v3.clients.h2")}</Title>
        </Wrap>
        <Reveal y={16} delay={0.08}>
          <ClientMarquee rows={1} />
        </Reveal>
      </section>

      {/* ---- what we make: one grid, straight into the catalogue */}
      <Block bg={CREAM}>
        <Title>{t("home.v3.make.h2")}</Title>
        <Reveal y={16} delay={0.08}>
          {/* phones: one swipeable row that runs to the screen edges, snapping tile
              by tile, with the next tile peeking in; from sm up: a plain grid */}
          <ul className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto overscroll-x-contain px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-14">
            {SOLUTION_TYPES.map((s) => (
              <li key={s.slug} className="w-[72%] shrink-0 snap-start sm:w-auto">
                <Link href={`/products?type=${s.slug}`} className="group block">
                  <div className="relative aspect-square overflow-hidden rounded-[20px]" style={{ backgroundColor: ROSE }}>
                    <Image
                      src={s.image}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
                    />
                  </div>
                  <span className="mt-4 block text-center font-display text-[clamp(1.1rem,1rem+0.4vw,1.35rem)] text-ink transition-colors group-hover:text-[#8b3343]">
                    {t(s.key)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal y={16} delay={0.12} className="mt-14 flex justify-center md:mt-16">
          <Link href="/products" className={btnQuiet}>
            {t("home.v3.make.all")}
            <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
        </Reveal>
      </Block>

      {/* ---- how it works: three plain steps */}
      <Block bg={ROSE}>
        <Title>{t("home.v3.steps.h2")}</Title>
        <Reveal y={16} delay={0.08}>
          <ol className="mx-auto grid max-w-[1000px] gap-12 text-center md:grid-cols-3 md:gap-10">
            {STEPS.map((n) => (
              <li key={n}>
                <span className="block font-display text-[2.4rem] leading-none text-[#8b3343]/70">
                  {String(n).padStart(2, "0")}
                </span>
                <h3 className="mt-5 text-[1.12rem] font-semibold text-ink">{t(`home.v3.steps.${n}.t`)}</h3>
                <p className="mx-auto mt-2 max-w-[30ch] text-[0.95rem] leading-relaxed text-muted">
                  {t(`home.v3.steps.${n}.d`)}
                </p>
              </li>
            ))}
          </ol>
        </Reveal>
      </Block>

      {/* ---- in their words */}
      <Block bg={CREAM}>
        <Title>{t("home.v3.voices.h2")}</Title>
        <Reveal y={16} delay={0.08}>
          <div className="grid gap-14 md:grid-cols-3 md:gap-10 lg:gap-14">
            {VOICES.map((v) => (
              <figure key={v.id} className="flex flex-col">
                <span aria-hidden className="font-display text-[3rem] leading-[0.6] text-[#8b3343]/50">
                  “
                </span>
                <blockquote className="mt-4 flex-1 text-[0.98rem] leading-[1.75] text-ink/75">
                  {t(`home.voices.list.${v.id}.quote`)}
                </blockquote>
                <figcaption className="mt-7 flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-white ring-1 ring-[#8b3343]/10">
                    {/* eslint-disable-next-line @next/next/no-img-element -- tiny static logo, no optimizer needed */}
                    <img src={v.logo} alt="" loading="lazy" className="size-full object-contain p-1.5" />
                  </span>
                  <span className="grid">
                    <span className="text-[0.92rem] font-semibold text-ink">{t(`home.voices.list.${v.id}.name`)}</span>
                    <span className="text-[0.8rem] text-faint">{t(`home.voices.list.${v.id}.role`)}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Reveal>
      </Block>

      <CtaBand />
    </>
  );
}
