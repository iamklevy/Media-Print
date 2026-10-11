import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { routing } from "@/i18n/routing";
import { PageHero } from "@/components/site/page-hero";
import { Section } from "@/components/site/section";
import { Faq } from "@/components/site/faq";
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
    title: t("title.faq"),
    description: t("desc.faq"),
    alternates: {
      canonical: locale === "en" ? "/faq" : `/${locale}/faq`,
      languages: { en: "/faq", ar: "/ar/faq" },
    },
  };
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <>
      <PageHero crumb={t("nav.faq")} title={t("ph.faq.h1")} lead={t("ph.faq.lead")} />
      <Section>
        <Faq />
      </Section>
      <CtaBand />
    </>
  );
}
