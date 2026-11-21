"use client";

import { useLocale, useTranslations } from "next-intl";
import { Globe } from "lucide-react";

import { Link, usePathname } from "@/i18n/navigation";

/** The same page in the other language — the footer's copy of the header switch. */
export function FooterLangLink({ className }: { className?: string }) {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <Link href={pathname} locale={locale === "ar" ? "en" : "ar"} className={className}>
      <Globe className="size-4 opacity-70" />
      {t("lang.label")}
    </Link>
  );
}
