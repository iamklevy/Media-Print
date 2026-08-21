"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export interface NavMenuItem {
  href: string;
  label: string;
}

/**
 * Nav dropdown modelled on the ePac reference: a plain white panel of text
 * links, left-aligned under its trigger, chevron flipping while open.
 *
 * Opens on hover only where hovering is real (`(hover: hover)`), so a tablet
 * does not get the classic touch trap where the first tap both opens the menu
 * and activates the trigger. Click and keyboard focus work everywhere.
 */
export function NavDropdown({
  label,
  items,
  isOpen,
  onOpen,
  onClose,
}: {
  label: string;
  items: NavMenuItem[];
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setCanHover(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // close on outside click and on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  return (
    <div
      ref={wrap}
      className="relative"
      onMouseEnter={canHover ? onOpen : undefined}
      onMouseLeave={canHover ? onClose : undefined}
      onFocus={onOpen}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) onClose();
      }}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={() => (isOpen ? onClose() : onOpen())}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-4 py-2 text-[0.96rem] font-semibold transition-colors",
          isOpen ? "text-accent-2" : "text-ink-2 hover:bg-paper-2",
        )}
      >
        {label}
        <ChevronDown
          className={cn("size-3.5 transition-transform duration-200", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        // pt-1 keeps the panel touching the trigger so the pointer never
        // crosses a gap on its way down (which would fire mouseleave)
        <div className="absolute start-0 top-full z-50 pt-1">
          <ul className="min-w-[15rem] overflow-hidden rounded-xl border border-line bg-paper py-2 shadow-lift">
            {items.map((it) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  onClick={onClose}
                  className="block whitespace-nowrap px-5 py-2 text-[0.95rem] text-ink-2 transition-colors hover:text-accent-2"
                >
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
