import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { routing } from "@/i18n/routing";
import { PageHero } from "@/components/site/page-hero";
import { Section, SectionHead } from "@/components/site/section";
import { StickerCatalogue, StickerOffers } from "@/components/site/sticker-catalogue";
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
    title: t("title.stick"),
    description: t("desc.stick"),
    alternates: {
      canonical: locale === "en" ? "/stickers" : `/${locale}/stickers`,
      languages: { en: "/stickers", ar: "/ar/stickers" },
    },
  };
}

export default async function StickersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <>
      <PageHero
        crumb={t("nav.stickers")}
        title={t("ph.stick.h1")}
        lead={t("ph.stick.lead")}
      />
      <Section>
        <StickerCatalogue />
      </Section>
      <Section tint>
        <SectionHead eyebrow={t("stick.offers")} title={t("stick.offers")} />
        <StickerOffers />
      </Section>
      <CtaBand />
    </>
  );
}
