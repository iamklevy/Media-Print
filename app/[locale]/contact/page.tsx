import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Phone, Mail, Clock, MapPin } from "lucide-react";

import { routing } from "@/i18n/routing";
import { PageHero } from "@/components/site/page-hero";
import { Section, SectionHead } from "@/components/site/section";
import { QuoteForm } from "@/components/site/quote-form";
import { MapEmbed } from "@/components/site/map-embed";
import { FacebookIcon } from "@/components/site/brand-icons";
import {
  SALES_PHONE, ADMIN_PHONE, ADMIN_PHONE_2,
  EMAIL, EMAIL_MARKETING, FACEBOOK,
} from "@/lib/contact";

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
        <div className="mb-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card icon={Phone} title={t("c.sales.t")} note={t("c.sales.d")}>
            <a href={`tel:+2${SALES_PHONE}`} dir="ltr" className="font-semibold hover:text-accent-2">
              {SALES_PHONE}
            </a>
          </Card>
          <Card icon={Phone} title={t("c.admin.t")} note={t("c.admin.d")}>
            <a href={`tel:+2${ADMIN_PHONE}`} dir="ltr" className="font-semibold hover:text-accent-2">
              {ADMIN_PHONE}
            </a>
            <a href={`tel:+2${ADMIN_PHONE_2}`} dir="ltr" className="font-semibold hover:text-accent-2">
              {ADMIN_PHONE_2}
            </a>
          </Card>
          <Card icon={Mail} title={t("c.mail.t")} note={t("c.mail.d")}>
            <a href={`mailto:${EMAIL}`} dir="ltr" className="font-semibold break-all hover:text-accent-2">
              {EMAIL}
            </a>
            <a href={`mailto:${EMAIL_MARKETING}`} dir="ltr" className="font-semibold break-all hover:text-accent-2">
              {EMAIL_MARKETING}
            </a>
          </Card>
          <Card icon={Clock} title={t("c.hours.t")} note={t("c.hours.v")}>
            <span className="mt-2 grid size-11 place-items-center rounded-xl bg-accent-soft text-accent-2">
              <MapPin className="size-5" />
            </span>
            <h3 className="mt-1 text-[1.02rem] font-bold">{t("c.addr.t")}</h3>
            <p className="text-[0.96rem] text-muted">{t("c.addr.v")}</p>
          </Card>
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            <SectionHead eyebrow={t("prod.eyebrow")} title={t("f.h2")} lead={t("f.lead")} />
            <QuoteForm />
          </div>
          <div className="grid gap-5">
            <MapEmbed title={t("c.map_title")} />
            <div className="grid gap-2 rounded-card border border-line bg-paper p-6">
              <span className="grid size-11 place-items-center rounded-xl bg-accent-soft text-accent-2">
                <FacebookIcon className="size-5" />
              </span>
              <h3 className="mt-1 text-[1.02rem] font-bold">{t("c.social.t")}</h3>
              <a
                href={FACEBOOK}
                target="_blank"
                rel="noopener"
                dir="ltr"
                className="font-semibold text-ink-2 hover:text-accent-2"
              >
                facebook.com/mediaprint.pack
              </a>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

function Card({
  icon: Icon,
  title,
  note,
  children,
}: {
  icon: typeof Phone;
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid content-start gap-1.5 rounded-card border border-line bg-paper p-6">
      <span className="mb-1 grid size-11 place-items-center rounded-xl bg-accent-soft text-accent-2">
        <Icon className="size-5" />
      </span>
      <h3 className="text-[1.02rem] font-bold">{title}</h3>
      {children}
      <p className="text-[0.96rem] text-muted">{note}</p>
    </div>
  );
}
