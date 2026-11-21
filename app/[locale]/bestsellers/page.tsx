import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PRODUCTS, BESTSELLERS } from "@/content/products";
import { routing } from "@/i18n/routing";
import { PageHero } from "@/components/site/page-hero";
import { Section } from "@/components/site/section";
import { ProductCard } from "@/components/site/product-card";
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
    title: t("title.best"),
    description: t("desc.best"),
    alternates: {
      canonical: locale === "en" ? "/bestsellers" : `/${locale}/bestsellers`,
      languages: { en: "/bestsellers", ar: "/ar/bestsellers" },
    },
  };
}

export default async function BestsellersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const ranked = BESTSELLERS.map((slug) => PRODUCTS.find((p) => p.slug === slug)!).filter(Boolean);

  return (
    <>
      <PageHero title={t("ph.best.h1")} lead={t("ph.best.lead")} />
      <Section>
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-14">
          {ranked.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
        <p className="mt-14 text-center text-[0.85rem] text-muted">{t("best.note")}</p>
      </Section>
      <CtaBand />
    </>
  );
}
