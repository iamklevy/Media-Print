"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowUp } from "lucide-react";

import { cn } from "@/lib/utils";

/** Show the button once the page is scrolled past this many viewport heights. */
const SHOW_AFTER_VIEWPORTS = 1;

/** Ring geometry for the scroll-progress outline (viewBox units). */
const R = 22;
const CIRCUMFERENCE = 2 * Math.PI * R;

/**
 * Floating "back to top" button, bottom corner (end side, so it flips in RTL).
 * Fades in after the first screen of scrolling; the ring around it fills as
 * you scroll down the page. Smooth-scrolls up unless reduced motion is on.
 */
export function BackToTop() {
  const t = useTranslations("nav");
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(window.scrollY > window.innerHeight * SHOW_AFTER_VIEWPORTS);
      setProgress(max > 0 ? Math.min(window.scrollY / max, 1) : 0);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  function scrollUp() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <button
      type="button"
      onClick={scrollUp}
      aria-label={t("back_to_top")}
      title={t("back_to_top")}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={cn(
        "group fixed bottom-5 end-5 z-40 grid size-12 place-items-center rounded-full bg-ink text-paper shadow-[0_10px_28px_-8px_rgb(38_28_18/0.45)] transition-all duration-300 hover:bg-accent sm:bottom-7 sm:end-7 sm:size-14",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      )}
    >
      {/* scroll-progress ring */}
      <svg aria-hidden viewBox="0 0 48 48" className="absolute inset-0 size-full -rotate-90">
        <circle cx="24" cy="24" r={R} fill="none" stroke="currentColor" strokeOpacity={0.15} strokeWidth={2} />
        <circle
          cx="24"
          cy="24"
          r={R}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
          className="text-accent transition-colors group-hover:text-paper"
        />
      </svg>
      <ArrowUp className="relative size-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
    </button>
  );
}
