import { Amiri, Fraunces } from "next/font/google";

/*
 * Display serifs for the homepage headlines (hero + section titles). Loaded
 * here, and applied only by the homepage, so other pages don't download them.
 * Fraunces echoes the soft serif on the Nuit boxes in the hero; Amiri is a
 * classic naskh that gives the Arabic the same refined, calligraphic feel.
 *
 * Usage: put `displayFontVars` on a wrapper around the page, then add the
 * `font-display` class (globals.css) to a heading. It picks Amiri on Arabic.
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
