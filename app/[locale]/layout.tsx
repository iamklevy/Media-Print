import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Manrope, IBM_Plex_Sans_Arabic } from "next/font/google";

import { routing, isRtl } from "@/i18n/routing";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import "../globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plex-arabic",
  display: "swap",
});

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
    title: t("title.home"),
    description: t("desc.home"),
    metadataBase: new URL("https://mediaprint-eg.com"),
    alternates: {
      canonical: locale === "en" ? "/" : `/${locale}`,
      languages: { en: "/", ar: "/ar" },
    },
    openGraph: {
      title: t("title.home"),
      description: t("desc.home"),
      locale: locale === "ar" ? "ar_EG" : "en_US",
      type: "website",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // opts this tree into static rendering
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      dir={isRtl(locale) ? "rtl" : "ltr"}
      className={`${manrope.variable} ${plexArabic.variable}`}
      suppressHydrationWarning
    >
      <body
        className={`bg-paper text-ink antialiased ${isRtl(locale) ? "font-arabic" : "font-sans"}`}
      >
        <NextIntlClientProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
