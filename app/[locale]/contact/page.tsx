import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { routing } from "@/i18n/routing";
import { PageHero } from "@/components/site/page-hero";
import { Section, SectionHead } from "@/components/site/section";
import { QuoteForm } from "@/components/site/quote-form";
import { MapEmbed } from "@/components/site/map-embed";

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
    title: t("title.contact"),
    description: t("desc.contact"),
    alternates: {
      canonical: locale === "en" ? "/contact" : `/${locale}/contact`,
      languages: { en: "/contact", ar: "/ar/contact" },
    },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <>
      <PageHero crumb={t("nav.contact")} title={t("ph.contact.h1")} lead={t("ph.contact.lead")} />

      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            <SectionHead eyebrow={t("prod.eyebrow")} title={t("f.h2")} lead={t("f.lead")} />
            <Suspense fallback={null}>
              <QuoteForm />
            </Suspense>
          </div>
          <MapEmbed title={t("c.map_title")} />
        </div>
      </Section>
    </>
  );
}
