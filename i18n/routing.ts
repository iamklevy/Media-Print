import { defineRouting } from "next-intl/routing";

/**
 * English is the default and stays un-prefixed at `/`, so existing links and
 * search rankings for the current site survive. Arabic gets its own indexable
 * tree at `/ar/...` — which is the whole point of the migration: the old
 * localStorage toggle meant Google only ever saw one language.
 */
export const routing = defineRouting({
  locales: ["en", "ar"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];

export const isRtl = (locale: string) => locale === "ar";
