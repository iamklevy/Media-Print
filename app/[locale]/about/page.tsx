import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Check } from "lucide-react";

import { CLIENTS } from "@/content/products";
import { routing } from "@/i18n/routing";
import { PageHero } from "@/components/site/page-hero";
import { Section, SectionHead } from "@/components/site/section";
import { CtaBand } from "@/components/site/cta-band";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("title.about"),
    description: t("desc.about"),
    alternates: {
      canonical: locale === "en" ? "/about" : `/${locale}/about`,
      languages: { en: "/about", ar: "/ar/about" },
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <>
      <PageHero crumb={t("nav.about")} title={t("ph.about.h1")} lead={t("ph.about.lead")} />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <span className="inline-flex items-center gap-2 text-[0.8rem] font-bold uppercase tracking-[0.12em] text-accent-2">
              <span className="inline-block h-0.5 w-6 rounded-sm bg-accent" />
              {t("about.story_eyebrow")}
            </span>
            <h2 className="mt-3 text-[clamp(1.75rem,1.2rem+2.2vw,2.85rem)]">{t("about.story_h2")}</h2>
            <p className="mt-4 max-w-[62ch] text-[clamp(1.02rem,0.96rem+0.3vw,1.2rem)] text-muted">
              {t("about.story_p")}
            </p>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-card border border-line bg-paper p-6">
              <strong className="block text-[2rem] leading-tight tracking-tight">{t("hero.float1.n")}</strong>
              <span className="text-[0.85rem] font-semibold text-muted">{t("hero.float1.l")}</span>
            </div>
            <div className="rounded-card border border-line bg-paper p-6">
              <strong className="block text-[2rem] leading-tight tracking-tight">{t("hero.float2.n")}</strong>
              <span className="text-[0.85rem] font-semibold text-muted">{t("hero.float2.l")}</span>
            </div>
            <div className="col-span-2 rounded-card border border-line bg-paper-2 p-6">
              <p className="text-[0.95rem] text-ink-2">{t("c.addr.v")}</p>
              <p className="mt-1 text-[0.85rem] text-muted">{t("c.hours.v")}</p>
            </div>
          </div>
        </div>
      </Section>

      <Section tint>
        <SectionHead eyebrow={t("why.eyebrow")} title={t("about.clients_h2")} />
        <div className="grid gap-8 md:gap-10">
          {CLIENTS.map((g) => (
            <div key={g.labelKey} className="grid gap-4">
              <span className="flex items-center gap-3 whitespace-nowrap text-[0.8rem] font-bold uppercase tracking-[0.11em] text-accent-2">
                {t(g.labelKey)}
                <span className="h-px flex-1 bg-line" />
              </span>
              <div className="flex flex-wrap gap-2">
                {g.names.map((c) => (
                  <span
                    key={c.name}
                    className="rounded-full border border-line bg-paper px-4 py-2 text-[0.95rem] font-semibold text-ink-2 transition hover:-translate-y-0.5 hover:border-accent/45"
                  >
                    {c.name}
                    {c.sub && <small className="block text-[0.76rem] font-medium text-muted">{c.sub}</small>}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
