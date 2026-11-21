import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { routing } from "@/i18n/routing";
import { PageHero } from "@/components/site/page-hero";
import { Section } from "@/components/site/section";
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
      <PageHero title={t("ph.contact.h1")} lead={t("ph.contact.lead")} wideLead />

      <Section>
        <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <Suspense fallback={null}>
            <QuoteForm />
          </Suspense>
          <div className="overflow-hidden rounded-[20px]">
            <MapEmbed title={t("c.map_title")} />
          </div>
        </div>
      </Section>
    </>
  );
}
