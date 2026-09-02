import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ArrowRight, Check, Printer, Layers, Scissors, Package, Upload, Quote,
  ShieldCheck, PenTool, Truck, Sticker, CreditCard, FileText, ShoppingBag,
  PackageOpen, Factory, Boxes, CalendarDays, MapPin,
} from "lucide-react";

import { PRODUCTS, CLIENTS } from "@/content/products";
import { INDUSTRIES, SOLUTION_TYPES } from "@/content/industries";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Wrap, Section, SectionHead, Eyebrow } from "@/components/site/section";
import { ProductCard } from "@/components/site/product-card";
import { CtaBand } from "@/components/site/cta-band";
import { Reveal, Stagger, StaggerItem, Counter, HoverLift } from "@/components/site/motion";
import { Faq } from "@/components/site/faq";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const MARQUEE = [
  { icon: Printer, k: "mq.1" }, { icon: Layers, k: "mq.2" },
  { icon: Scissors, k: "mq.3" }, { icon: Package, k: "mq.4" },
  { icon: ShieldCheck, k: "mq.5" }, { icon: PenTool, k: "mq.6" },
  { icon: Check, k: "mq.7" }, { icon: Truck, k: "mq.8" },
];

/**
 * Hero collage floating over the blob. Cartons are real client work from
 * public/products; the sticker/zipper-bag shots are stock photography
 * (Unsplash, same convention as the catalogue images in content/products.ts)
 * standing in until we have our own client photography for those lines.
 */
const HERO_CARDS = [
  { src: "/products/cartons-6.png", cls: "top-[2%] start-[26%] w-[34%] [--rot:-7deg] [animation-delay:0s]" },
  { src: "/products/cartons-8.png", cls: "top-[9%] end-[1%] w-[27%] [--rot:6deg] [animation-delay:0.9s]" },
  {
    src: "https://images.unsplash.com/photo-1780444078356-5ca1e9efe6b8?w=1100&q=72&auto=format&fit=crop",
    cls: "top-[36%] start-[4%] w-[30%] [--rot:5deg] [animation-delay:0.4s]",
  },
  {
    src: "https://images.unsplash.com/photo-1773525912464-d2640e7aff9c?w=1100&q=72&auto=format&fit=crop",
    cls: "top-[40%] start-[44%] w-[21%] [--rot:-4deg] [animation-delay:1.4s]",
  },
  {
    src: "https://images.unsplash.com/photo-1633533452206-8ab246b00e30?w=1100&q=72&auto=format&fit=crop",
    cls: "bottom-[1%] start-[22%] w-[29%] [--rot:-6deg] [animation-delay:0.7s]",
  },
  {
    src: "https://images.unsplash.com/photo-1572689535562-3c54a15292d3?w=1100&q=72&auto=format&fit=crop",
    cls: "bottom-[7%] end-[3%] w-[26%] [--rot:8deg] [animation-delay:1.8s]",
  },
];

const HERO_STEPS = [
  { icon: Package, k: "hero.v2.s1" },
  { icon: Upload, k: "hero.v2.s2" },
  { icon: Truck, k: "hero.v2.s3" },
];

/** Only figures that can be checked against the price list. */
const STATS = [
  { icon: Boxes, value: 13, suffix: "", k: "home.stats.products_n" },
  { icon: Factory, value: 300, suffix: "", k: "home.stats.moq_n" },
  { icon: CalendarDays, value: 6, suffix: "", k: "home.stats.days_n" },
  { icon: MapPin, value: 27, suffix: "", k: "home.stats.gov_n" },
];

const SOLUTION_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  labels: Sticker,
  boxes: Package,
  bags: ShoppingBag,
  cards: CreditCard,
  flyers: FileText,
  "zipper-pouches": PackageOpen,
};

const OUR_WORK_SLUGS = ["apparel", "paper-bags", "cartons", "corrugated", "tags", "stickers"];

/** Testimonials. Quotes/names/roles live in messages under home.voices.list.<id>;
    the logo is the client's mark from public/clients (same files as the client wall). */
const VOICES = [
  { id: "carina", logo: "/clients/carina.jpg" },
  { id: "joviality", logo: "/clients/joviality.jpg" },
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
      {/* ============================================ 1. hero (unchanged) */}
      <section className="relative isolate overflow-hidden bg-ink py-14 text-paper md:py-20">
        <Wrap>
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            <div className="relative order-last mx-auto min-h-[400px] w-full max-w-[560px] sm:min-h-[480px] lg:order-first lg:min-h-[560px] lg:max-w-none">
              <div
                aria-hidden
                className="absolute top-1/2 start-[-16%] size-[115%] max-h-[640px] max-w-[640px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,#ED8340_0%,var(--color-accent)_48%,var(--color-accent-2)_100%)]"
              />
              {HERO_CARDS.map((c, i) => (
                <div
                  key={c.src}
                  className={`absolute aspect-square overflow-hidden rounded-2xl shadow-deep motion-safe:animate-[floaty_6s_ease-in-out_infinite] ${c.cls}`}
                >
                  <Image
                    src={c.src}
                    alt=""
                    fill
                    priority={i < 2}
                    sizes="(max-width: 1024px) 34vw, 18vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>

            <div>
              <h1 className="max-w-[14ch] text-[clamp(2.3rem,1.4rem+3.6vw,4.2rem)] leading-[1.08] text-paper">
                {t("hero.v2.h1")}
              </h1>
              <p className="mt-6 max-w-[44ch] text-[clamp(1rem,0.95rem+0.3vw,1.18rem)] leading-relaxed text-paper/75">
                {t("hero.v2.lead")}
              </p>
              <hr className="my-8 max-w-[440px] border-paper/15" />
              <div className="grid max-w-[520px] grid-cols-3 gap-5">
                {HERO_STEPS.map(({ icon: Icon, k }, i) => (
                  <div key={k} className="grid content-start gap-2.5">
                    <Icon className="size-7 text-paper/90" strokeWidth={1.5} />
                    <span className="flex items-start gap-2">
                      <span className="text-[2rem] font-extrabold leading-none text-accent">{i + 1}</span>
                      <span className="pt-0.5 text-[0.86rem] font-bold leading-snug text-paper">{t(k)}</span>
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-7 text-[0.82rem] text-paper/60">{t("hero.v2.foot")}</p>
              <Button asChild size="lg" className="mt-8 rounded-full bg-accent px-9 text-[1rem] font-bold hover:bg-accent-2">
                <Link href="/contact">{t("hero.v2.cta")}</Link>
              </Button>
            </div>
          </div>
        </Wrap>
      </section>

      {/* ================================================== 2. capability strip */}
      <div className="overflow-hidden border-y border-line bg-paper-2 py-4" aria-hidden>
        <div className="flex w-max animate-[marquee_34s_linear_infinite] gap-12 rtl:[animation-direction:reverse]">
          {[...MARQUEE, ...MARQUEE].map(({ icon: Icon, k }, i) => (
            <span key={`${k}-${i}`} className="inline-flex items-center gap-2 whitespace-nowrap text-[0.95rem] font-semibold text-muted">
              <Icon className="size-4 text-accent" />
              {t(k)}
            </span>
          ))}
        </div>
      </div>

      {/* ============================================ 3. proof in numbers */}
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

      {/* ============================================ 4. client wall (dark) */}
      <Section ink>
        <Reveal>
          <SectionHead onInk eyebrow={t("home.clients.eyebrow")} title={t("home.clients.h2")} lead={t("home.clients.lead")} />
        </Reveal>
        <div className="grid gap-8 md:gap-10">
          {CLIENTS.map((g, gi) => (
            <Reveal key={g.labelKey} delay={gi * 0.08}>
              <div className="grid gap-4">
                <span className="flex items-center gap-3 whitespace-nowrap text-[0.8rem] font-bold uppercase tracking-[0.11em] text-accent">
                  {t(g.labelKey)}
                  <span className="h-px flex-1 bg-white/15" />
                </span>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {g.names.map((c) => (
                    <figure
                      key={c.name}
                      className="m-0 flex h-full flex-col items-center gap-3 rounded-2xl border border-white/12 bg-white/5 p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:bg-white/10"
                    >
                      {/* white plate so every logo keeps its own colours on the dark band —
                          darkPlate flips this for logos that are themselves white-on-transparent */}
                      <span
                        className={`grid h-16 w-full place-items-center overflow-hidden rounded-xl px-3 py-2 ${
                          c.darkPlate ? "bg-ink" : "bg-white"
                        }`}
                      >
                        {c.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element -- tiny static logos, no optimizer needed (and it can't serve the .svg)
                          <img src={c.logo} alt="" loading="lazy" className="max-h-12 w-auto max-w-full object-contain" />
                        ) : (
                          <span aria-hidden className="text-[1.5rem] font-extrabold text-ink/80">
                            {c.name.charAt(0)}
                          </span>
                        )}
                      </span>
                      <figcaption className="leading-tight">
                        <span className="block text-[0.9rem] font-semibold text-paper">{c.name}</span>
                        {c.sub && <span className="block text-[0.74rem] font-medium text-paper/55">{c.sub}</span>}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ============================================ 5. choose your industry */}
      <Section>
        <Reveal>
          <SectionHead eyebrow={t("home.industry.eyebrow")} title={t("home.industry.h2")} lead={t("home.industry.lead")} />
        </Reveal>
        <Stagger className="grid gap-5 sm:grid-cols-2">
          {INDUSTRIES.map((ind) => (
            <StaggerItem key={ind.slug}>
              <HoverLift>
                <Link
                  href={`/products?industry=${ind.slug}`}
                  className="group relative isolate flex min-h-[280px] flex-col justify-end overflow-hidden rounded-[28px] p-7 shadow-soft transition-shadow duration-500 hover:shadow-deep md:p-8"
                >
                  <Image
                    src={ind.image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
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
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      {/* ============================================ 6. browse by type */}
      <Section tint>
        <Reveal>
          <SectionHead eyebrow={t("home.solutions.eyebrow")} title={t("home.solutions.h2")} lead={t("home.solutions.lead")} />
        </Reveal>
        <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {SOLUTION_TYPES.map((s) => {
            const Icon = SOLUTION_ICON[s.slug];
            return (
              <StaggerItem key={s.slug}>
                <Link
                  href={`/products?type=${s.slug}`}
                  className="group flex h-full flex-col items-center gap-3 rounded-card border border-line bg-paper px-4 py-7 text-center transition-all duration-300 hover:-translate-y-1 hover:border-accent/35 hover:shadow-soft"
                >
                  <span className="grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent-2 transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
                    <Icon className="size-5" />
                  </span>
                  <span className="font-semibold">{t(s.key)}</span>
                </Link>
              </StaggerItem>
            );
          })}
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
          {WHY.map((b) => (
            <StaggerItem key={b.k} className={b.span === "wide" ? "md:col-span-2" : ""}>
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
                    className={`mb-6 grid size-12 place-items-center rounded-2xl ${
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
                src="/products/cartons-4.png"
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
          <SectionHead eyebrow={t("home.faq.eyebrow")} title={t("home.faq.h2")} />
        </Reveal>
        <Reveal delay={0.08}>
          <Faq />
        </Reveal>
      </Section>

      <CtaBand />
    </>
  );
}
