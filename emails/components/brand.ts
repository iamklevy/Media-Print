// Brand tokens for email. Mirrors the @theme palette in app/globals.css —
// emails can't read CSS variables, so the hex values are repeated here.
export const color = {
  ink: "#16130f",
  muted: "#6e645a",
  faint: "#a8a098",
  line: "#e9e2d7",
  paper: "#fffdfa",
  paper2: "#f7f2ea",
  accent: "#dd6320",
  accent2: "#b3480f",
  accentSoft: "#fdf1e7",
  leaf: "#2f6b4f",
  leafSoft: "#e8f3ed",
};

export const fontStack = {
  en: "Manrope, 'Segoe UI', Helvetica, Arial, sans-serif",
  ar: "'IBM Plex Sans Arabic', 'Segoe UI', Tahoma, Arial, sans-serif",
};

// Images in email must be absolute and publicly reachable, so a localhost
// NEXT_PUBLIC_SITE_URL (dev) falls back to the production domain.
const envSite = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
export const SITE_URL = envSite.startsWith("https://") ? envSite : "https://mediaprint-eg.com";
export const LOGO_URL = `${SITE_URL}/logo.png`;

export type Locale = "ar" | "en";
export const isAr = (locale: string): locale is "ar" => locale === "ar";
