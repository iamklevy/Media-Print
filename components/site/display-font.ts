import { Amiri, Fraunces } from "next/font/google";

/*
 * Display serifs for the public site's headlines (hero, page and section titles).
 * Applied once on <html> by app/[locale]/layout.tsx.
 * Fraunces echoes the soft serif on the Nuit boxes in the hero; Amiri is a
 * classic naskh that gives the Arabic the same refined, calligraphic feel.
 *
 * Usage: add the `font-display` class (globals.css) to a heading. It picks
 * Amiri on Arabic.
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz", "SOFT"],
  display: "swap",
  variable: "--font-fraunces",
});

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["700"],
  display: "swap",
  variable: "--font-amiri",
});

export const displayFontVars = `${fraunces.variable} ${amiri.variable}`;
