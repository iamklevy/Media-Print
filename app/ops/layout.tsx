import type { Metadata } from "next";
import { Manrope, IBM_Plex_Sans_Arabic } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Operations — Media Print Pack",
  robots: { index: false, follow: false },
};

// Internal staff tool: no next-intl routing (stays at /ops, never /ar/ops).
// The board can still switch to Arabic via a cookie-driven locale toggle —
// see lib/ops-locale.ts and KanbanBoard, which wraps its own content in a
// NextIntlClientProvider and flips `dir` on an inner wrapper instead of
// here on <html>, since /ops/login always stays English regardless of the
// staff board's saved language.
export default function OpsLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${plexArabic.variable}`} data-scroll-behavior="smooth">
      <body className="bg-paper-2 text-ink antialiased">{children}</body>
    </html>
  );
}
