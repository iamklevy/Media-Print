"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Phones: one horizontal row of snapping slides that bleeds to the screen
 * edges, with dots underneath showing (and jumping to) the current slide.
 * From `sm` up the same children fall into the grid given by `gridClassName`
 * and the dots go away. Active slide is tracked with an IntersectionObserver,
 * so it works the same in RTL.
 */
export function SnapScroller({
  children,
  labels,
  gridClassName,
}: {
  children: ReactNode;
  /** accessible name per dot, e.g. "Show Cosmetics & Perfumes" */
  labels: string[];
  gridClassName: string;
}) {
  const slides = Children.toArray(children);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const items = Array.from(track.children) as HTMLElement[];
    const ratios = new Map<Element, number>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => ratios.set(e.target, e.intersectionRatio));
        let best = 0;
        let bestRatio = -1;
        items.forEach((el, i) => {
          const r = ratios.get(el) ?? 0;
          if (r > bestRatio) {
            best = i;
            bestRatio = r;
          }
        });
        setActive(best);
      },
      { root: track, threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [slides.length]);

  function go(i: number) {
    const el = trackRef.current?.children[i] as HTMLElement | undefined;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", inline: "center", block: "nearest" });
  }

  return (
    <div>
      <div
        ref={trackRef}
        className={cn(
          // phone: edge-to-edge snapping row (the page gutter is 1.25rem)
          "-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto overscroll-x-contain px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "*:w-[86%] *:shrink-0 *:snap-center",
          // sm+: a plain grid, no scrolling
          "sm:mx-0 sm:overflow-visible sm:px-0 sm:*:w-auto",
          gridClassName,
        )}
      >
        {slides}
      </div>

      <div className="mt-4 flex justify-center gap-2 sm:hidden">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => go(i)}
            aria-label={labels[i]}
            aria-current={i === active || undefined}
            className="grid h-6 place-items-center px-0.5"
          >
            <span
              className={cn(
                "block h-2 rounded-full transition-all duration-300",
                i === active ? "w-6 bg-accent" : "w-2 bg-ink/20",
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
