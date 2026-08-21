"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Menu, Globe, Package, ChevronDown } from "lucide-react";

import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { NavDropdown, type NavMenuItem } from "./nav-dropdown";
import { PRODUCTS } from "@/content/products";
import { INDUSTRIES } from "@/content/industries";
import { cn } from "@/lib/utils";

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
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<"browse" | "markets" | null>(null);
  const [mobileSection, setMobileSection] = useState<"browse" | "markets" | null>(null);

  const other = locale === "ar" ? "en" : "ar";

  // No effect is needed to close on navigation: dropdown links call onClose
  // themselves, sheet links call setOpen(false), and clicking anything else
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
    <header className="sticky top-0 z-50 border-b border-transparent bg-paper/85 backdrop-blur-md backdrop-saturate-150 transition-[border-color,box-shadow] has-[.stuck]:border-line">
      <div className="mx-auto flex w-[min(1200px,100%-2.5rem)] items-center gap-6 py-3">
        <Link href="/" className="me-auto flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-white p-[3px] shadow-soft">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" className="size-full object-contain" />
          </span>
          <span className="leading-tight">
            <span className="block text-[1.06rem] font-extrabold tracking-tight">
              {t("brand.name")}
            </span>
            <span className="hidden text-[0.74rem] font-medium text-muted sm:block">
              {t("brand.tag")}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {MENUS.map((m) => (
            <NavDropdown
              key={m.id}
              label={m.label}
              items={m.items}
              isOpen={menu === m.id}
              onOpen={() => setMenu(m.id)}
              onClose={() => setMenu((cur) => (cur === m.id ? null : cur))}
            />
          ))}

          {LINKS.map(({ href, key }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-full px-4 py-2 text-[0.96rem] font-semibold text-ink-2 transition-colors hover:bg-paper-2",
                pathname.startsWith(href) && "bg-accent-soft text-accent-2",
              )}
            >
              {t(`nav.${key}`)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href={pathname} locale={other}>
              <Globe className="size-4 opacity-60" />
              {t("lang.label")}
            </Link>
          </Button>

          <Button asChild className="hidden rounded-full bg-accent hover:bg-accent-2 sm:inline-flex">
            <Link href="/contact">{t("cta.quote")}</Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl lg:hidden"
                aria-label={t("nav.menu_arialabel")}
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side={locale === "ar" ? "left" : "right"}
              className="w-[min(340px,88vw)] overflow-y-auto p-6 pt-16"
            >
              <SheetTitle className="sr-only">{t("nav.menu_arialabel")}</SheetTitle>
              <nav className="flex flex-col gap-1">
                {/* the same two menus, as accordions */}
                {MENUS.map((m) => {
                  const expanded = mobileSection === m.id;
                  return (
                    <div key={m.id}>
                      <button
                        type="button"
                        aria-expanded={expanded}
                        onClick={() => setMobileSection(expanded ? null : m.id)}
                        className="flex w-full items-center justify-between rounded-full px-4 py-3 text-[1.05rem] font-semibold hover:bg-paper-2"
                      >
                        {m.label}
                        <ChevronDown
                          className={cn(
                            "size-4 transition-transform duration-200",
                            expanded && "rotate-180",
                          )}
                        />
                      </button>
                      {expanded && (
                        <ul className="mb-1 grid gap-0.5 ps-3">
                          {m.items.map((it) => (
                            <li key={it.href}>
                              <Link
                                href={it.href}
                                onClick={() => setOpen(false)}
                                className="block rounded-full px-4 py-2 text-[0.95rem] text-ink-2 hover:bg-paper-2 hover:text-accent-2"
                              >
                                {it.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}

                {LINKS.map(({ href, key }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="rounded-full px-4 py-3 text-[1.05rem] font-semibold hover:bg-paper-2"
                  >
                    {t(`nav.${key}`)}
                  </Link>
                ))}

                <Link
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className="mt-3 flex items-center gap-2 rounded-full bg-accent px-4 py-3 font-semibold text-white"
                >
                  <Package className="size-4" />
                  {t("cta.quote")}
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
