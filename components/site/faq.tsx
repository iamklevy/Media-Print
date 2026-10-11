"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";

const IDS = ["moq", "artwork", "sample", "lead", "shipping", "design"] as const;

export function Faq() {
  const t = useTranslations("home.faq");
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<string | null>(IDS[0]);

  return (
    <div className="mx-auto grid max-w-[760px] gap-3">
      {IDS.map((id) => {
        const isOpen = open === id;
        return (
          <div
            key={id}
            className={cn(
              "overflow-hidden rounded-card border bg-paper transition-colors",
              isOpen ? "border-accent/35 shadow-soft" : "border-line",
            )}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : id)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-start"
            >
              <span className="text-[1.02rem] font-bold">{t(`${id}.q`)}</span>
              <Plus
                className={cn(
                  "size-5 shrink-0 text-accent-2 transition-transform duration-300",
                  isOpen && "rotate-45",
                )}
              />
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduce ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: [0.22, 0.61, 0.36, 1] }}
                >
                  <p className="px-6 pb-6 text-[0.96rem] leading-relaxed text-muted">
                    {t(`${id}.a`)}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
