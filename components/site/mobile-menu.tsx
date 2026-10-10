"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Dialog } from "radix-ui";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { Menu, X, ChevronDown, Package, Calendar } from "lucide-react";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { SALES_PHONE } from "@/lib/contact";
import { WhatsAppIcon } from "./brand-icons";
import type { NavMenuItem } from "./nav-dropdown";

type MenuId = "browse" | "markets";

/** The glass + orange glow shared with the scrolled header capsule. */
const GLASS =
  "border border-accent/20 bg-paper/80 bg-[radial-gradient(260px_160px_at_0%_0%,rgb(237_131_64/0.28),transparent_70%),radial-gradient(260px_200px_at_100%_100%,rgb(237_131_64/0.2),transparent_70%)] shadow-[0_18px_44px_-12px_rgb(221_99_32/0.4)] backdrop-blur-xl backdrop-saturate-150";

/** Height of the header capsule — the card opens from, and closes back to, exactly this. */
const CAPSULE_H = 58;
const EASE = [0.22, 1, 0.36, 1] as const;

// links cascade down on open, and back up (last one first) on close
const list: Variants = {
  closed: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
  open: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
};
const item: Variants = {
  closed: { opacity: 0, y: -8, transition: { duration: 0.2, ease: "easeIn" } },
  open: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

/**
 * Mobile menu: the header capsule "grows" downward into a frosted glass card,
 * the hamburger turns into an orange ×, and the links cascade in. Closing is
 * the exact reverse — links cascade out, the × spins away, and the card
 * shrinks back to the capsule's size and spot before handing back to it. Radix Dialog supplies focus trap, Escape and
 * scroll lock; forceMount + AnimatePresence lets Motion play the exit.
 */
export function MobileMenu({
  menus,
  links,
  overlay,
}: {
  menus: { id: MenuId; label: string; items: NavMenuItem[] }[];
  links: readonly { href: string; key: string }[];
  /** the header is sitting transparent over the homepage hero */
  overlay: boolean;
}) {
  const t = useTranslations();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<MenuId | null>(null);

  const close = () => setOpen(false);
  const instant = reduce ? { duration: 0 } : undefined;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setSection(null);
      }}
    >
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label={t("nav.menu_arialabel")}
          className={cn(
            "grid size-10 place-items-center rounded-full border transition-colors xl:hidden",
            overlay
              ? "border-white/25 bg-white/10 text-white hover:bg-white/20"
              : "border-line bg-paper/70 text-ink hover:bg-paper",
          )}
        >
          <Menu className="size-5" />
        </button>
      </Dialog.Trigger>

      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                // must be fully gone before the card fades, or the capsule underneath
                // shows blurred for a beat and then snaps sharp
                exit={{ opacity: 0, transition: instant ?? { duration: 0.28, delay: 0.12 } }}
                transition={instant ?? { duration: 0.25 }}
                className="fixed inset-0 z-[60] bg-ink/25 backdrop-blur-[3px] xl:hidden"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild forceMount aria-describedby={undefined}>
              <motion.div
                initial={{ height: CAPSULE_H, opacity: 0 }}
                animate={{
                  height: "auto",
                  opacity: 1,
                  transition: instant ?? {
                    height: { duration: 0.45, ease: EASE },
                    opacity: { duration: 0.12 },
                  },
                }}
                // waits for the links to leave, shrinks to the capsule, then fades
                exit={{
                  height: CAPSULE_H,
                  opacity: 0,
                  transition: instant ?? {
                    height: { duration: 0.4, delay: 0.12, ease: EASE },
                    opacity: { duration: 0.12, delay: 0.5 },
                  },
                }}
                className={cn(
                  "fixed inset-x-2 top-2 z-[61] max-h-[calc(100svh-1rem)] overflow-x-hidden overflow-y-auto overscroll-contain rounded-[30px] px-2.5 pb-3.5 text-ink outline-none xl:hidden",
                  GLASS,
                )}
              >
                <Dialog.Title className="sr-only">{t("nav.menu_arialabel")}</Dialog.Title>

                {/* same row as the capsule, so it reads as the capsule opening */}
                <div className="flex h-[58px] items-center gap-2.5 ps-0.5">
                  <Link href="/" onClick={close} className="flex min-w-0 flex-1 items-center gap-2.5">
                    <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-white p-[3px] shadow-soft">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/logo.png" alt="" className="size-full object-contain" />
                    </span>
                    <span className="truncate text-[0.98rem] font-extrabold tracking-tight">{t("brand.name")}</span>
                  </Link>
                  <Dialog.Close asChild>
                    <motion.button
                      type="button"
                      aria-label={t("nav.close_arialabel")}
                      initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
                      animate={{ rotate: 0, scale: 1, opacity: 1, transition: instant ?? { duration: 0.35, delay: 0.05 } }}
                      exit={{ rotate: -90, scale: 0.6, opacity: 0, transition: instant ?? { duration: 0.3, delay: 0.25 } }}
                      className="grid size-10 place-items-center rounded-full bg-accent text-white shadow-[0_8px_20px_-6px_rgb(221_99_32/0.7)] hover:bg-accent-2"
                    >
                      <X className="size-5" />
                    </motion.button>
                  </Dialog.Close>
                </div>

                <span
                  aria-hidden
                  className="mx-2 mb-2 mt-0.5 block h-px bg-[linear-gradient(90deg,transparent,rgb(221_99_32/0.4),transparent)]"
                />

                <motion.nav variants={list} initial="closed" animate="open" exit="closed" className="flex flex-col gap-0.5">
                  {menus.map((m) => {
                    const expanded = section === m.id;
                    return (
                      <motion.div key={m.id} variants={item}>
                        <button
                          type="button"
                          aria-expanded={expanded}
                          onClick={() => setSection(expanded ? null : m.id)}
                          className={cn(
                            "flex w-full items-center justify-between rounded-full px-4 py-3 text-[1.03rem] font-semibold transition-colors",
                            expanded ? "bg-paper text-accent-2 shadow-soft" : "hover:bg-paper/70",
                          )}
                        >
                          {m.label}
                          <ChevronDown
                            className={cn("size-4 transition-transform duration-300", expanded && "rotate-180")}
                          />
                        </button>
                        <AnimatePresence initial={false}>
                          {expanded && (
                            <motion.ul
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={instant ?? { duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                              className="grid gap-0.5 overflow-hidden ps-3"
                            >
                              {m.items.map((it) => (
                                <li key={it.href} className="first:pt-1 last:pb-1">
                                  <Link
                                    href={it.href}
                                    onClick={close}
                                    className="block rounded-full px-4 py-2 text-[0.95rem] text-ink-2 transition-colors hover:bg-paper/70 hover:text-accent-2"
                                  >
                                    {it.label}
                                  </Link>
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}

                  {links.map(({ href, key }) => (
                    <motion.div key={href} variants={item}>
                      <Link
                        href={href}
                        onClick={close}
                        className={cn(
                          "block rounded-full px-4 py-3 text-[1.03rem] font-semibold transition-colors",
                          pathname.startsWith(href) ? "bg-paper text-accent-2 shadow-soft" : "hover:bg-paper/70",
                        )}
                      >
                        {t(`nav.${key}`)}
                      </Link>
                    </motion.div>
                  ))}

                  <motion.div variants={item} className="mt-3 grid grid-cols-2 gap-2">
                    <Link
                      href="/contact"
                      onClick={close}
                      className="flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 text-[0.95rem] font-bold text-white shadow-[0_10px_24px_-8px_rgb(221_99_32/0.6)] hover:bg-accent-2"
                    >
                      <Package className="size-4" />
                      {t("cta.quote")}
                    </Link>
                    <Link
                      href="/book"
                      onClick={close}
                      className="flex items-center justify-center gap-2 rounded-full border border-accent/20 bg-accent-soft/90 px-4 py-3 text-[0.95rem] font-bold text-accent-2"
                    >
                      <Calendar className="size-4" />
                      {t("cta.book")}
                    </Link>
                  </motion.div>

                  <motion.div variants={item} className="mt-2">
                    <a
                      href={`https://wa.me/20${SALES_PHONE}`}
                      target="_blank"
                      rel="noopener"
                      onClick={close}
                      className="flex items-center justify-center gap-2 rounded-full bg-[#1DA851] px-4 py-3 text-[0.95rem] font-bold text-white"
                    >
                      <WhatsAppIcon className="size-4" />
                      {t("cta.whatsapp")}
                    </a>
                  </motion.div>
                </motion.nav>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
