import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PRODUCTS } from "@/content/products";
import { routing } from "@/i18n/routing";
import { PageHero } from "@/components/site/page-hero";
import { Section } from "@/components/site/section";
import { ProductGrid } from "@/components/site/product-grid";
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
    title: t("title.products"),
    description: t("desc.products"),
    alternates: {
      canonical: locale === "en" ? "/products" : `/${locale}/products`,
      languages: { en: "/products", ar: "/ar/products" },
    },
  };
}

export default async function ProductsPage({
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
        crumb={t("nav.products")}
        title={t("ph.products.h1")}
        lead={t("ph.products.lead")}
      />
      <Section>
        <ProductGrid products={PRODUCTS} />
      </Section>
      <CtaBand />
    </>
  );
}
