import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Clock, MapPin } from "lucide-react";

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
      <PageHero crumb={t("nav.book")} title={t("ph.book.h1")} lead={t("ph.book.lead")} />
      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <BookingForm />
          </div>
          <div className="grid gap-5">
            <MapEmbed title={t("c.map_title")} />
            <div className="grid gap-2 rounded-card border border-line bg-paper p-6">
              <span className="grid size-11 place-items-center rounded-xl bg-accent-soft text-accent-2">
                <Clock className="size-5" />
              </span>
              <h3 className="mt-1 text-[1.02rem]">{t("c.hours.t")}</h3>
              <p className="text-[0.96rem] text-muted">{t("c.hours.v")}</p>
              <span className="mt-3 grid size-11 place-items-center rounded-xl bg-accent-soft text-accent-2">
                <MapPin className="size-5" />
              </span>
              <h3 className="mt-1 text-[1.02rem]">{t("c.addr.t")}</h3>
              <p className="text-[0.96rem] text-muted">{t("c.addr.v")}</p>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
