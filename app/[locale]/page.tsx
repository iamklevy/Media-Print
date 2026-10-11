import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ArrowRight, Layers, Quote, ShieldCheck, Truck, Factory, Boxes, CalendarDays, MapPin,
} from "lucide-react";

import { PRODUCTS } from "@/content/products";
import { INDUSTRIES, SOLUTION_TYPES } from "@/content/industries";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Section, SectionHead, Eyebrow } from "@/components/site/section";
import { ProductCard } from "@/components/site/product-card";
import { IndustryShowcase } from "@/components/site/industry-showcase";
import { CtaBand } from "@/components/site/cta-band";
import { HomeHero, HeroReflection } from "@/components/site/home-hero";
import { ClientMarquee } from "@/components/site/client-marquee";
import { Reveal, Stagger, StaggerItem, Counter, HoverLift } from "@/components/site/motion";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/** Only figures that can be checked against the price list. */
const STATS = [
  { icon: Boxes, value: 13, suffix: "", k: "home.stats.products_n" },
  { icon: Factory, value: 300, suffix: "", k: "home.stats.moq_n" },
  { icon: CalendarDays, value: 6, suffix: "", k: "home.stats.days_n" },
  { icon: MapPin, value: 27, suffix: "", k: "home.stats.gov_n" },
];

const OUR_WORK_SLUGS = ["apparel", "paper-bags", "cartons", "corrugated", "tags", "stickers"];

/** Testimonials. Quotes/names/roles live in messages under home.voices.list.<id>;
    the logo is the client's mark from public/clients (same files as the client wall). */
const VOICES = [
  { id: "carina", logo: "/clients/carina.png" },
  { id: "joviality", logo: "/clients/joviality.png" },
  { id: "hajarafa", logo: "/clients/haj-arafa.png" },
] as const;

/** Graphic cards, no photography — see notes in the section below. */
const WHY = [
  { k: "why.1", tag: "why.1.tag", icon: Factory, tone: "ink" as const, span: "wide" as const },
  { k: "why.2", tag: "why.2.tag", icon: ShieldCheck, tone: "paper" as const, span: null },
  { k: "why.3", tag: "why.3.tag", icon: Layers, tone: "accent" as const, span: null, stat: "1,000", statK: "hero.float1.l" },
  { k: "why.4", tag: "why.4.tag", icon: Truck, tone: "paper" as const, span: "wide" as const },
];

const WHY_TONE = {
  ink: "bg-ink text-paper",
  accent: "bg-[linear-gradient(150deg,var(--color-accent)_0%,var(--color-accent-2)_100%)] text-white",
  paper: "border border-line bg-paper text-ink",
};

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const ourWork = OUR_WORK_SLUGS.map((slug) => PRODUCTS.find((p) => p.slug === slug)!).filter(Boolean);

  return (
    <>
      {/* ============================================ 1. hero */}
      <HomeHero />

      {/* ============================================ 3. client wall (dark) */}
      {/* its background is the hero photo's blurred reflection */}
      <Section ink className="relative isolate overflow-hidden pb-14! md:pb-20! lg:pb-24!">
        <HeroReflection />
        <Reveal>
          <SectionHead center onInk eyebrow={t("home.clients.eyebrow")} title={t("home.clients.h2")} lead={t("home.clients.lead")} />
        </Reveal>
        <Reveal delay={0.08}>
          <ClientMarquee />
        </Reveal>
      </Section>

      {/* ============================================ 4. choose your industry */}
      <Section>
        <Reveal>
          <SectionHead title={t("home.industry.h2")} lead={t("home.industry.lead")} />
        </Reveal>
        <Reveal delay={0.08}>
          <IndustryShowcase industries={INDUSTRIES} />
        </Reveal>
      </Section>

      {/* ============================================ 5. browse by type */}
      <Section tint>
        <Reveal>
          <SectionHead title={t("home.solutions.h2")} lead={t("home.solutions.lead")} />
        </Reveal>
        <Stagger className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {SOLUTION_TYPES.map((s) => (
            <StaggerItem key={s.slug}>
              <HoverLift className="h-full">
                <Link
                  href={`/products?type=${s.slug}`}
                  className="group flex h-full flex-col rounded-[22px] border border-line bg-paper p-2 shadow-soft transition-[border-color,box-shadow] duration-500 hover:border-accent/35 hover:shadow-deep sm:p-2.5"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[16px] bg-paper-2">
                    <Image
                      src={s.image}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col px-2 pb-2 pt-4 sm:px-3 sm:pb-3">
                    <span className="flex items-center justify-between gap-3 text-[clamp(1.02rem,0.95rem+0.35vw,1.2rem)] font-bold">
                      {t(s.key)}
                      <ArrowRight className="size-4 shrink-0 text-faint transition-all group-hover:translate-x-0.5 group-hover:text-accent rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                    </span>
                    <span className="mt-1.5 text-[0.86rem] leading-relaxed text-muted sm:text-[0.92rem]">{t(s.descKey)}</span>
                  </div>
                </Link>
              </HoverLift>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      {/* ============================================ 6. proof in numbers */}
      <Section>
        <Reveal>
          <SectionHead eyebrow={t("home.stats.eyebrow")} title={t("home.stats.h2")} lead={t("home.stats.lead")} />
        </Reveal>
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map(({ icon: Icon, value, suffix, k }) => (
            <StaggerItem key={k}>
              <div className="h-full rounded-card border border-line bg-paper p-7 transition-colors hover:border-accent/35">
                <Icon className="mb-5 size-6 text-accent-2" strokeWidth={1.6} />
                <Counter
                  value={value}
                  suffix={suffix}
                  className="block text-[clamp(2.2rem,1.6rem+2vw,3.2rem)] font-extrabold leading-none tracking-tight"
                />
                <span className="mt-3 block text-[0.9rem] leading-snug text-muted">{t(k)}</span>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      {/* ============================================ 7. our work */}
      <Section>
        <Reveal>
          <SectionHead eyebrow={t("home.work.eyebrow")} title={t("home.work.h2")} lead={t("home.work.lead")} />
        </Reveal>
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ourWork.map((p) => (
            <StaggerItem key={p.slug} className="h-full">
              <ProductCard product={p} showSpecs={false} />
            </StaggerItem>
          ))}
        </Stagger>
        <Reveal delay={0.1}>
          <Button asChild variant="outline" size="lg" className="mt-10 rounded-full">
            <Link href="/bestsellers">
              {t("home.work.all")}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
          </Button>
        </Reveal>
      </Section>

      {/* ============================================ 8. process (rail) */}
      <Section tint>
        <Reveal>
          <SectionHead eyebrow={t("home.process.eyebrow")} title={t("home.process.h2")} lead={t("home.process.lead")} />
        </Reveal>
        <div className="relative">
          {/* the rail the steps sit on — desktop only */}
          <span
            aria-hidden
            className="absolute inset-x-0 top-[26px] hidden h-px bg-[linear-gradient(90deg,transparent,var(--color-line)_12%,var(--color-line)_88%,transparent)] lg:block"
          />
          <Stagger className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {[1, 2, 3, 4].map((n) => (
              <StaggerItem key={n}>
                <div className="relative">
                  <span className="relative z-10 grid size-[52px] place-items-center rounded-full border border-accent/25 bg-accent-soft text-[1.15rem] font-extrabold text-accent-2">
                    {n}
                  </span>
                  <h3 className="mt-5 text-[clamp(1.1rem,1rem+0.5vw,1.32rem)]">{t(`proc.${n}.t`)}</h3>
                  <p className="mt-2 text-[0.93rem] leading-relaxed text-muted">{t(`proc.${n}.d`)}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Section>

      {/* ============================================ 9. why us (graphic) */}
      <Section>
        <Reveal>
          <SectionHead eyebrow={t("home.why.eyebrow")} title={t("home.why.h2")} />
        </Reveal>
        <Stagger className="grid gap-4 md:grid-cols-2">
          {WHY.map((b, i) => (
            <StaggerItem key={b.k} className={`relative ${b.span === "wide" ? "md:col-span-2" : ""}`}>
              {/* mobile-only ambient halo — there's no hover there, so the card
                  stays lit on its own instead of leaning on the desktop ring */}
              <span
                aria-hidden
                style={{ animationDelay: `${i * 0.4}s` }}
                className={`pointer-events-none absolute -inset-5 -z-10 rounded-[38px] blur-2xl motion-safe:animate-[glow-pulse_4s_ease-in-out_infinite] md:hidden ${
                  b.tone === "accent" ? "bg-white/40" : "bg-accent/30"
                }`}
              />
              <article
                className={`group relative h-full overflow-hidden rounded-[30px] p-8 transition-shadow duration-500 hover:shadow-deep md:p-10 ${WHY_TONE[b.tone]}`}
              >
                {/* soft ring, purely decorative */}
                <span
                  aria-hidden
                  className={`pointer-events-none absolute -end-16 -top-16 size-56 rounded-full transition-transform duration-[1200ms] group-hover:scale-125 ${
                    b.tone === "paper" ? "bg-accent-soft/70" : "bg-white/10"
                  }`}
                />
                <div className="relative">
                  <span
                    style={{ animationDelay: `${i * 0.25}s` }}
                    className={`mb-6 grid size-12 place-items-center rounded-2xl max-md:motion-safe:animate-[icon-float_3s_ease-in-out_infinite] ${
                      b.tone === "paper" ? "bg-accent-soft text-accent-2" : "bg-white/15 text-white"
                    }`}
                  >
                    <b.icon className="size-6" strokeWidth={1.6} />
                  </span>
                  <span
                    className={`mb-3 inline-flex w-fit rounded-full px-3 py-1 text-[0.72rem] font-bold uppercase tracking-wider ${
                      b.tone === "paper"
                        ? "border border-accent/25 bg-accent-soft text-accent-2"
                        : "border border-white/20 bg-white/10"
                    }`}
                  >
                    {t(b.tag)}
                  </span>
                  <h3 className="mb-3 text-[clamp(1.3rem,1.05rem+0.8vw,1.75rem)] tracking-tight">{t(`${b.k}.t`)}</h3>
                  <p className={`max-w-[52ch] text-[0.96rem] leading-relaxed ${b.tone === "paper" ? "text-muted" : "text-white/80"}`}>
                    {t(`${b.k}.d`)}
                  </p>
                  {b.stat && (
                    <span className="mt-7 block text-[clamp(2rem,1.4rem+2vw,3rem)] font-extrabold leading-none tracking-tight">
                      {b.stat}
                      <small className="mt-2 block text-[0.3em] font-semibold uppercase tracking-wider opacity-75">
                        {t(b.statK!)}
                      </small>
                    </span>
                  )}
                </div>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      {/* ============================================ 10. finishing (split) */}
      <Section tint>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[30px] shadow-deep">
              <Image
                src="/products/cartons-nuit-perfume-oil-pastel-lineup.png"
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div>
              <Eyebrow>{t("home.finishing.eyebrow")}</Eyebrow>
              <h2 className="mt-3 text-[clamp(1.75rem,1.2rem+2.2vw,2.85rem)]">{t("home.finishing.h2")}</h2>
              <p className="mt-4 max-w-[52ch] text-[clamp(1.02rem,0.96rem+0.3vw,1.2rem)] text-muted">
                {t("home.finishing.lead")}
              </p>
              <Button asChild size="lg" variant="outline" className="mt-8 rounded-full">
                <Link href="/services">
                  {t("home.finishing.cta")}
                  <ArrowRight className="size-4 rtl:rotate-180" />
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ============================================ 11. testimonials */}
      <Section>
        <Reveal>
          <SectionHead eyebrow={t("home.voices.eyebrow")} title={t("home.voices.h2")} lead={t("home.voices.lead")} />
        </Reveal>
        <Stagger className="grid gap-5 md:grid-cols-3">
          {VOICES.map((v) => (
            <StaggerItem key={v.id} className="h-full">
              <figure className="flex h-full flex-col rounded-card border border-line bg-paper-2 p-7">
                <Quote className="mb-4 size-7 text-accent/45" />
                <blockquote className="flex-1 text-[0.98rem] leading-relaxed text-muted">
                  {t(`home.voices.list.${v.id}.quote`)}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-5">
                  <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-white ring-1 ring-line">
                    {/* eslint-disable-next-line @next/next/no-img-element -- tiny static logo, no optimizer needed */}
                    <img src={v.logo} alt="" loading="lazy" className="size-full object-contain p-1.5" />
                  </span>
                  <span className="grid">
                    <span className="text-[0.92rem] font-bold text-ink">{t(`home.voices.list.${v.id}.name`)}</span>
                    <span className="text-[0.82rem] text-faint">{t(`home.voices.list.${v.id}.role`)}</span>
                  </span>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      {/* ============================================ 12. FAQ */}
      <Section tint>
        <Reveal>
          <SectionHead eyebrow={t("home.faq.eyebrow")} title={t("home.faq.h2")} lead={t("home.faq.blurb")} />
        </Reveal>
        <Reveal delay={0.08}>
          <div className="flex justify-center">
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link href="/faq">
                {t("home.faq.cta")}
                <ArrowRight className="size-4 rtl:rotate-180" />
              </Link>
            </Button>
          </div>
        </Reveal>
      </Section>

      <CtaBand />
    </>
  );
}
