import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ArrowRight, Check, Printer, Layers, Scissors, Package,
  ShieldCheck, PenTool, Truck, Sticker, CreditCard, FileText, ShoppingBag, PackageOpen,
} from "lucide-react";

import { PRODUCTS } from "@/content/products";
import { INDUSTRIES, SOLUTION_TYPES } from "@/content/industries";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Wrap, Section, SectionHead, Eyebrow } from "@/components/site/section";
import { ProductCard } from "@/components/site/product-card";
import { CtaBand } from "@/components/site/cta-band";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const MARQUEE = [
  { icon: Printer, k: "mq.1" }, { icon: Layers, k: "mq.2" },
  { icon: Scissors, k: "mq.3" }, { icon: Package, k: "mq.4" },
  { icon: ShieldCheck, k: "mq.5" }, { icon: PenTool, k: "mq.6" },
  { icon: Check, k: "mq.7" }, { icon: Truck, k: "mq.8" },
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

const BENTO = [
  {
    k: "why.3", tag: "why.3.tag", tone: "paper" as const, span: "tall" as const,
    img: "https://images.unsplash.com/photo-1648587456176-4969b0124b12?w=1100&q=72&auto=format&fit=crop",
    stat: "1,000", statK: "hero.float1.l",
  },
  {
    k: "why.1", tag: "why.1.tag", tone: "ink" as const, span: "wide" as const,
    img: "https://images.unsplash.com/photo-1503694978374-8a2fa686963a?w=1100&q=72&auto=format&fit=crop",
  },
  {
    k: "why.2", tag: "why.2.tag", tone: "rust" as const, span: null,
    img: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1100&q=72&auto=format&fit=crop",
  },
  {
    k: "why.4", tag: "why.4.tag", tone: "deep" as const, span: null,
    img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1100&q=72&auto=format&fit=crop",
  },
];

const TONE = {
  paper: "text-ink border border-line [--a:rgba(255,253,250,0.96)] [--b:rgba(255,253,250,0.86)] [--c:rgba(255,253,250,0.42)]",
  ink: "text-paper [--a:rgba(18,15,12,0.94)] [--b:rgba(18,15,12,0.66)] [--c:rgba(18,15,12,0.30)]",
  rust: "text-paper [--a:rgba(96,30,6,0.94)] [--b:rgba(96,30,6,0.68)] [--c:rgba(96,30,6,0.32)]",
  deep: "text-paper [--a:rgba(10,40,54,0.94)] [--b:rgba(10,40,54,0.68)] [--c:rgba(10,40,54,0.32)]",
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
      {/* ---------------------------------------------------------- hero */}
      <section className="relative isolate overflow-hidden py-12 md:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-[22%] -end-[12%] -z-10 size-[62vw] max-h-[820px] max-w-[820px] rounded-full bg-[radial-gradient(circle,var(--color-accent-soft),transparent_62%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-[30%] -start-[18%] -z-10 size-[48vw] max-h-[620px] max-w-[620px] rounded-full bg-[radial-gradient(circle,rgba(47,107,79,0.07),transparent_66%)]"
        />
        <Wrap>
          <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
            <div>
              <h1 className="text-[clamp(2.15rem,1.35rem+3.4vw,4rem)]">
                {t("hero.h1a")}{" "}
                <span className="relative whitespace-nowrap text-accent-2">
                  {t("hero.h1b")}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-[0.06em] -z-10 h-[0.3em] rounded-sm bg-accent/16"
                  />
                </span>{" "}
                {t("hero.h1c")}
              </h1>

              <p className="mt-4 text-[clamp(1.02rem,0.96rem+0.3vw,1.2rem)] text-muted">
                {t("hero.lead")}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-full bg-accent hover:bg-accent-2">
                  <Link href="/contact">
                    {t("cta.quote")}
                    <ArrowRight className="size-4 rtl:rotate-180" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full">
                  <Link href="/book">{t("cta.book")}</Link>
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                {["hero.chip1", "hero.chip2", "hero.chip3"].map((k) => (
                  <span
                    key={k}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-[0.88rem] font-semibold text-ink-2"
                  >
                    <Check className="size-3.5 text-leaf" />
                    {t(k)}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[460px] lg:max-w-none">
              <div className="relative aspect-[4/4.4] overflow-hidden rounded-[30px] shadow-deep">
                <Image
                  src="https://images.unsplash.com/photo-1513672494107-cd9d848a383e?w=1200&q=72&auto=format&fit=crop"
                  alt={t("hero.art_alt")}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -start-[6%] bottom-[8%] flex items-center gap-3 rounded-card border border-line bg-paper px-4 py-3 shadow-lift">
                <span className="grid size-9 place-items-center rounded-xl bg-accent-soft text-accent-2">
                  <Layers className="size-5" />
                </span>
                <span>
                  <strong className="block text-[1.5rem] leading-tight tracking-tight">
                    {t("hero.float1.n")}
                  </strong>
                  <span className="text-[0.78rem] font-semibold text-muted">
                    {t("hero.float1.l")}
                  </span>
                </span>
              </div>
              <div className="absolute -end-[5%] top-[7%] rounded-card border border-line bg-paper px-4 py-3 text-center shadow-lift">
                <strong className="block text-[1.5rem] leading-tight tracking-tight">
                  {t("hero.float2.n")}
                </strong>
                <span className="text-[0.78rem] font-semibold text-muted">
                  {t("hero.float2.l")}
                </span>
              </div>
            </div>
          </div>
        </Wrap>
      </section>

      {/* ------------------------------------------------------- marquee */}
      <div className="overflow-hidden border-y border-line bg-paper-2 py-4" aria-hidden>
        <div className="flex w-max animate-[marquee_34s_linear_infinite] gap-12 rtl:[animation-direction:reverse]">
          {[...MARQUEE, ...MARQUEE].map(({ icon: Icon, k }, i) => (
            <span
              key={`${k}-${i}`}
              className="inline-flex items-center gap-2 whitespace-nowrap text-[0.95rem] font-semibold text-muted"
            >
              <Icon className="size-4 text-accent" />
              {t(k)}
            </span>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------ choose industry */}
      <Section>
        <SectionHead
          eyebrow={t("home.industry.eyebrow")}
          title={t("home.industry.h2")}
          lead={t("home.industry.lead")}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          {INDUSTRIES.map((ind) => (
            <Link
              key={ind.slug}
              href={`/products?industry=${ind.slug}`}
              className="group relative isolate flex min-h-[280px] flex-col justify-end overflow-hidden rounded-[28px] p-7 transition-all duration-500 hover:-translate-y-1 hover:shadow-deep md:p-8"
            >
              <Image
                src={ind.image}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="-z-20 object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <span
                aria-hidden
                className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(18,15,12,0.15)_0%,rgba(18,15,12,0.55)_55%,rgba(18,15,12,0.92)_100%)]"
              />
              <h3 className="text-[clamp(1.3rem,1.05rem+0.8vw,1.6rem)] text-paper">{t(`${ind.key}.name`)}</h3>
              <p className="mt-2 max-w-[38ch] text-[0.92rem] leading-relaxed text-paper/78">
                {t(`${ind.key}.blurb`)}
              </p>
              <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/12 px-3.5 py-1.5 text-[0.85rem] font-semibold text-paper backdrop-blur-sm transition-all group-hover:gap-2.5 group-hover:bg-white/20">
                {t("cta.products")}
                <ArrowRight className="size-3.5 rtl:rotate-180" />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* -------------------------------------------- explore solutions */}
      <Section tint>
        <SectionHead
          eyebrow={t("home.solutions.eyebrow")}
          title={t("home.solutions.h2")}
          lead={t("home.solutions.lead")}
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {SOLUTION_TYPES.map((s) => {
            const Icon = SOLUTION_ICON[s.slug];
            return (
              <Link
                key={s.slug}
                href={`/products?type=${s.slug}`}
                className="group flex flex-col items-center gap-3 rounded-card border border-line bg-paper px-4 py-7 text-center transition-all hover:-translate-y-1 hover:border-accent/35 hover:shadow-soft"
              >
                <span className="grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent-2 transition-colors group-hover:bg-accent group-hover:text-white">
                  <Icon className="size-5" />
                </span>
                <span className="font-semibold">{t(s.key)}</span>
              </Link>
            );
          })}
        </div>
      </Section>

      {/* -------------------------------------------------- finishing */}
      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[30px] shadow-deep">
            <Image
              src="/products/cartons-4.png"
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
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
        </div>
      </Section>

      {/* ------------------------------------------------------- process */}
      <Section tint>
        <SectionHead eyebrow={t("proc.eyebrow")} title={t("proc.h2")} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="relative pt-11">
              <span className="absolute top-0 start-0 text-[1.9rem] font-extrabold tracking-tight text-accent/85">
                0{n}
              </span>
              <h3 className="mb-2 text-[clamp(1.15rem,1rem+0.6vw,1.4rem)]">{t(`proc.${n}.t`)}</h3>
              <p className="text-[0.93rem] text-muted">{t(`proc.${n}.d`)}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------- our work */}
      <Section>
        <SectionHead
          eyebrow={t("home.work.eyebrow")}
          title={t("home.work.h2")}
          lead={t("home.work.lead")}
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ourWork.map((p) => (
            <ProductCard key={p.slug} product={p} showSpecs={false} />
          ))}
        </div>
        <Button asChild variant="outline" size="lg" className="mt-10 rounded-full">
          <Link href="/bestsellers">
            {t("home.work.all")}
            <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
        </Button>
      </Section>

      {/* --------------------------------------------------------- why us */}
      <Section tint>
        <SectionHead eyebrow={t("home.why.eyebrow")} title={t("home.why.h2")} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {BENTO.map((b) => (
            <article
              key={b.k}
              className={`group relative isolate flex min-h-[310px] flex-col overflow-hidden rounded-[30px] p-7 transition-all duration-500 hover:-translate-y-1 hover:shadow-deep md:p-9 ${TONE[b.tone]} ${
                b.span === "tall" ? "lg:row-span-2 lg:min-h-[420px]" : ""
              } ${b.span === "wide" ? "lg:col-span-2" : ""}`}
            >
              <Image
                src={b.img}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="-z-20 object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <span
                aria-hidden
                className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,var(--a)_0%,var(--b)_52%,var(--c)_100%)]"
              />
              <span
                className={`mb-4 inline-flex w-fit items-center rounded-full px-3 py-1 text-[0.76rem] font-bold uppercase tracking-wider ${
                  b.tone === "paper"
                    ? "border border-accent/25 bg-accent-soft text-accent-2"
                    : "border border-white/20 bg-white/14 backdrop-blur-sm"
                }`}
              >
                {t(b.tag)}
              </span>
              <h3 className="mb-3 text-[clamp(1.3rem,1.05rem+0.8vw,1.75rem)] tracking-tight">
                {t(`${b.k}.t`)}
              </h3>
              <p className={`max-w-[46ch] text-[0.96rem] leading-relaxed ${b.tone === "paper" ? "text-muted" : "text-paper/80"}`}>
                {t(`${b.k}.d`)}
              </p>
              {b.stat && (
                <span className="mt-auto pt-6 text-[clamp(1.9rem,1.3rem+2vw,2.9rem)] font-extrabold leading-none tracking-tight">
                  {b.stat}
                  <small className="mt-2 block text-[0.3em] font-semibold uppercase tracking-wider opacity-70">
                    {t(b.statK!)}
                  </small>
                </span>
              )}
            </article>
          ))}
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
