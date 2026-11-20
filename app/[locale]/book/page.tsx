import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { routing } from "@/i18n/routing";
import { PageHero } from "@/components/site/page-hero";
import { Section } from "@/components/site/section";
import { BookingForm } from "@/components/site/booking-form";
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
        <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <BookingForm />
          <div className="grid gap-8">
            <div className="overflow-hidden rounded-[20px]">
              <MapEmbed title={t("c.map_title")} />
            </div>
            <dl className="grid gap-5 border-t border-line pt-6 text-[0.96rem]">
              <div>
                <dt className="font-display text-[1.1rem] text-ink">{t("c.hours.t")}</dt>
                <dd className="mt-1 text-muted">{t("c.hours.v")}</dd>
              </div>
              <div>
                <dt className="font-display text-[1.1rem] text-ink">{t("c.addr.t")}</dt>
                <dd className="mt-1 text-muted">{t("c.addr.v")}</dd>
              </div>
            </dl>
          </div>
        </div>
      </Section>
    </>
  );
}
