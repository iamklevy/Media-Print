import { Amiri, Caveat, Fraunces, Marhey } from "next/font/google";

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

/*
 * Handwritten "signature" accent (the footer's "made in Giza"): marker-pen
 * handwriting in both scripts — Caveat for Latin, Marhey for Arabic — chosen
 * to stay legible small and to look like the same hand. Only used below the fold,
 * so not preloaded. Usage: the `font-signature` class (globals.css).
 */
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
  preload: false,
  variable: "--font-signature",
});

const marhey = Marhey({
  subsets: ["arabic"],
  weight: ["600"],
  display: "swap",
  preload: false,
  variable: "--font-signature-ar",
});

export const displayFontVars = `${fraunces.variable} ${amiri.variable} ${caveat.variable} ${marhey.variable}`;
