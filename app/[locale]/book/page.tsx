import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { routing } from "@/i18n/routing";
import { PageHero } from "@/components/site/page-hero";
import { Section } from "@/components/site/section";
import { BookingForm } from "@/components/site/booking-form";

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
    title: t("title.book"),
    description: t("desc.book"),
    alternates: {
      canonical: locale === "en" ? "/book" : `/${locale}/book`,
      languages: { en: "/book", ar: "/ar/book" },
    },
  };
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <>
      <PageHero title={t("ph.book.h1")} lead={t("ph.book.lead")} />
      <Section>
        {/* steps on the left, the summary + map (for office visits) on the right */}
        <BookingForm />
      </Section>
    </>
  );
}
