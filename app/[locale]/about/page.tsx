import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { routing } from "@/i18n/routing";
import { PageHero } from "@/components/site/page-hero";
import { Section, SectionHead } from "@/components/site/section";
import { CtaBand } from "@/components/site/cta-band";
import { ClientMarquee } from "@/components/site/client-marquee";
import { Reveal } from "@/components/site/motion";

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
    title: t("title.about"),
    description: t("desc.about"),
    alternates: {
      canonical: locale === "en" ? "/about" : `/${locale}/about`,
      languages: { en: "/about", ar: "/ar/about" },
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <>
      <PageHero title={t("ph.about.h1")} lead={t("ph.about.lead")} />

      <Section>
        <SectionHead title={t("about.story_h2")} />
        <Reveal y={16} delay={0.08}>
          <p className="mx-auto max-w-[56ch] text-center text-[clamp(1.02rem,0.96rem+0.3vw,1.18rem)] leading-[1.8] text-ink/75">
            {t("about.story_p")}
          </p>
        </Reveal>
      </Section>

      {/* the same calm logo row as the homepage */}
      <Section ink className="overflow-hidden">
        <SectionHead title={t("about.clients_h2")} />
        <Reveal y={16} delay={0.08}>
          <ClientMarquee rows={1} />
        </Reveal>
      </Section>

      <CtaBand />
    </>
  );
}
