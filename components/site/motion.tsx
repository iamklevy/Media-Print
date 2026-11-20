"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Fade + rise, the one motion the public site uses below the hero.
 *
 * A thin client wrapper that takes server-rendered `children`, so the copy
 * inside stays in the HTML for crawlers — the client bundle only carries the
 * animation. Collapses to "just show it" under prefers-reduced-motion.
 */

const EASE = [0.22, 0.61, 0.36, 1] as const;

/** Fade + rise as the element scrolls into view. */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "span";
}) {
  const reduce = useReducedMotion();
  const M = motion[as];

  return (
    <M
      data-reveal
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </M>
  );
}
