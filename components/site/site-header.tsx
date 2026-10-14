"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Globe } from "lucide-react";

import { Link, usePathname } from "@/i18n/navigation";
import { NavDropdown, type NavMenuItem } from "./nav-dropdown";
import { PRODUCTS } from "@/content/products";
import { INDUSTRIES } from "@/content/industries";
import { cn } from "@/lib/utils";
import { MobileMenu } from "./mobile-menu";

/** Plain links, shown after the two dropdowns. */
const LINKS = [
  { href: "/services", key: "finishing" },
  { href: "/bestsellers", key: "portfolio" },
  { href: "/about", key: "about" },
] as const;

export function SiteHeader() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const [menu, setMenu] = useState<"browse" | "markets" | null>(null);

  const other = locale === "ar" ? "en" : "ar";

  // On the homepage the header floats, transparent, over the hero photo
  // (HomeHero pulls itself up underneath); it turns solid once scrolled.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const sync = () => setScrolled(window.scrollY > 24);
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  }, []);
  const overlay = pathname === "/" && !scrolled;

  // No effect is needed to close on navigation: dropdown links call onClose
  // themselves, mobile-menu links close the menu, and clicking anything else
  // fires NavDropdown's outside-pointerdown handler.

  // every product on the site, each to its own page
  const productItems: NavMenuItem[] = PRODUCTS.map((p) => ({
    href: `/products/${p.slug}`,
    label: t(`${p.key}.t`),
  }));

  // the same four industries as the homepage "Choose your industry" cards
  const marketItems: NavMenuItem[] = [
    ...INDUSTRIES.map((ind) => ({
      href: `/products?industry=${ind.slug}`,
      label: t(`${ind.key}.name`),
    })),
    { href: "/products", label: t("industry.all") },
  ];

  const MENUS = [
    { id: "browse" as const, label: t("nav.browse"), items: productItems },
    { id: "markets" as const, label: t("nav.markets"), items: marketItems },
  ];

  return (
    // The header strip itself is always transparent and click-through; the bar
    // inside is what changes — flat over the homepage hero, a floating frosted
    // capsule everywhere else. Height stays 72px either way
    // so HomeHero's -mt-[72px] still lines up.
    <header
      className={cn(
        "pointer-events-none sticky top-0 z-50 flow-root h-[72px] transition-colors duration-300",
        overlay ? "text-white" : "text-ink",
      )}
    >
      <div
        className={cn(
          "pointer-events-auto mx-auto flex items-center gap-4 border transition-all duration-500 ease-out",
          overlay
            ? "mt-0 h-[72px] w-[min(1200px,100%-2.5rem)] rounded-none border-transparent px-0"
            : "mt-2 h-[58px] w-[min(1240px,100%-1rem)] rounded-full border-line bg-paper/75 ps-2.5 pe-2 shadow-soft backdrop-blur-xl backdrop-saturate-150",
        )}
      >
        <Link href="/" className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
          <span className="grid size-9 shrink-0 sm:size-10 place-items-center overflow-hidden rounded-xl bg-white p-[3px] shadow-soft">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" className="size-full object-contain" />
          </span>
          <span className="leading-tight">
            <span className="block whitespace-nowrap text-[0.98rem] font-extrabold tracking-tight sm:text-[1.04rem]">
              {t("brand.name")}
            </span>
            <span
              className={cn(
                "hidden text-[0.72rem] font-medium sm:block",
                overlay ? "text-white/65" : "text-muted",
              )}
            >
              {t("brand.tag")}
            </span>
          </span>
        </Link>

        {/* the centre pill */}
        <nav
          className={cn(
            "hidden items-center gap-0.5 rounded-full border p-1 transition-colors duration-300 lg:flex",
            overlay ? "border-white/15 bg-white/10 backdrop-blur-md" : "border-transparent",
          )}
        >
          {MENUS.map((m) => (
            <NavDropdown
              key={m.id}
              label={m.label}
              items={m.items}
              isOpen={menu === m.id}
              onOpen={() => setMenu(m.id)}
              onClose={() => setMenu((cur) => (cur === m.id ? null : cur))}
              onDark={overlay}
            />
          ))}

          {LINKS.map(({ href, key }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-full px-4 py-1.5 text-[0.93rem] font-semibold transition-colors",
                  overlay
                    ? "text-white/85 hover:bg-white/10 hover:text-white"
                    : active
                      ? "bg-paper text-accent-2 shadow-soft"
                      : "text-ink-2 hover:bg-paper",
                )}
              >
                {t(`nav.${key}`)}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-1.5">
          <Link
            href={pathname}
            locale={other}
            className={cn(
              "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-[0.93rem] font-semibold transition-colors",
              overlay ? "text-white/85 hover:bg-white/10 hover:text-white" : "text-ink-2 hover:bg-paper-2",
            )}
          >
            <Globe className="size-4 opacity-70" />
            {t("lang.label")}
          </Link>

          <Link
            href="/book"
            className={cn(
              "hidden whitespace-nowrap rounded-full px-3 py-2 text-[0.93rem] font-semibold transition-colors xl:inline-flex",
              overlay ? "text-white/85 hover:bg-white/10 hover:text-white" : "text-ink-2 hover:bg-paper-2",
            )}
          >
            {t("cta.book")}
          </Link>

          <Link
            href="/contact"
            className={cn(
              "ms-1 hidden whitespace-nowrap rounded-full px-5 py-2.5 text-[0.93rem] font-bold transition-colors sm:inline-flex",
              overlay
                ? "bg-white text-ink hover:bg-accent hover:text-white"
                : "bg-accent text-white hover:bg-accent-2",
            )}
          >
            {t("cta.quote")}
          </Link>

          <MobileMenu menus={MENUS} links={LINKS} overlay={overlay} />
        </div>
      </div>
    </header>
  );
}
