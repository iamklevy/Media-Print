import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Sticker, NotebookPen, Printer, Layers, GalleryVerticalEnd, PenTool,
  ShoppingBag, Check,
} from "lucide-react";

import { routing } from "@/i18n/routing";
import { PageHero } from "@/components/site/page-hero";
import { Section } from "@/components/site/section";
import { CtaBand } from "@/components/site/cta-band";

const SERVICES = [
  { icon: Sticker, k: "s.metalize" },
  { icon: NotebookPen, k: "s.notepad" },
  { icon: Printer, k: "s.letterhead" },
  { icon: Sticker, k: "s.sticker" },
  { icon: Layers, k: "s.duplex" },
  { icon: GalleryVerticalEnd, k: "s.rollup" },
  { icon: PenTool, k: "s.flyer" },
  { icon: ShoppingBag, k: "s.promo" },
];

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
    title: t("title.services"),
    description: t("desc.services"),
    alternates: {
      canonical: locale === "en" ? "/services" : `/${locale}/services`,
      languages: { en: "/services", ar: "/ar/services" },
    },
  };
}

export default async function ServicesPage({
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
        crumb={t("nav.finishing")}
        title={t("ph.services.h1")}
        lead={t("ph.services.lead")}
      />

      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          {SERVICES.map(({ icon: Icon, k }) => (
            <div
              key={k}
              className="flex items-start gap-4 rounded-card border border-line bg-paper p-6 transition-all hover:-translate-y-0.5 hover:border-accent/35 hover:shadow-soft"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-paper-2 text-accent-2">
                <Icon className="size-5" />
              </span>
              <div>
                <h3 className="mb-1 text-[1.06rem]">{t(`${k}.t`)}</h3>
                <p className="text-[0.9rem] leading-relaxed text-muted">{t(`${k}.d`)}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section tint>
        <div className="mx-auto max-w-[62ch] text-center">
          <span className="text-[0.9rem] font-bold uppercase tracking-wider text-accent-2">
            {t("srv.extra.t")}
          </span>
          <h2 className="mt-3 text-[clamp(1.75rem,1.2rem+2.2vw,2.85rem)]">
            {t("srv.extra.d")}
          </h2>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-2.5">
          {["hero.chip1", "mq.6", "hero.chip3"].map((k) => (
            <span
              key={k}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-5 py-2.5 font-semibold"
            >
              <Check className="size-4 text-accent" />
              {t(k)}
            </span>
          ))}
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
