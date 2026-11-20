import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { routing } from "@/i18n/routing";
import { PageHero } from "@/components/site/page-hero";
import { Section } from "@/components/site/section";
import { CtaBand } from "@/components/site/cta-band";
import { Reveal } from "@/components/site/motion";

const SERVICES = ["s.metalize", "s.sticker", "s.duplex", "s.promo", "s.flyer", "s.letterhead", "s.notepad", "s.rollup"];

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
    title: t("title.services"),
    description: t("desc.services"),
    alternates: {
      canonical: locale === "en" ? "/services" : `/${locale}/services`,
      languages: { en: "/services", ar: "/ar/services" },
    },
  };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <>
      <PageHero title={t("ph.services.h1")} lead={t("ph.services.lead")} />

      <Section>
        <Reveal y={16}>
          <ul className="mx-auto grid max-w-[980px] gap-x-16 md:grid-cols-2">
            {SERVICES.map((k) => (
              <li key={k} className="border-b border-line py-7">
                <h2 className="font-display text-[clamp(1.2rem,1.08rem+0.5vw,1.45rem)] text-ink">{t(`${k}.t`)}</h2>
                <p className="mt-1.5 text-[0.95rem] leading-relaxed text-muted">{t(`${k}.d`)}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </Section>

      <CtaBand />
    </>
  );
}
