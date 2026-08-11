"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Menu, Globe, Package } from "lucide-react";

import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", key: "home" },
  { href: "/bestsellers", key: "best" },
  { href: "/products", key: "products" },
  { href: "/stickers", key: "stickers" },
  { href: "/services", key: "services" },
  { href: "/contact", key: "contact" },
] as const;

export function SiteHeader() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const other = locale === "ar" ? "en" : "ar";

  return (
    <>
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
            {NAV.map(({ href, key }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "rounded-full px-4 py-2 text-[0.96rem] font-semibold text-ink-2 transition-colors hover:bg-paper-2",
                    active && "bg-accent-soft text-accent-2",
                  )}
                >
                  {t(`nav.${key}`)}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href={pathname} locale={other}>
                <Globe className="size-4 opacity-60" />
                {t("lang.label")}
              </Link>
            </Button>

            <Button asChild className="hidden rounded-full bg-accent hover:bg-accent-2 sm:inline-flex">
              <Link href="/book">{t("cta.book")}</Link>
            </Button>

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-xl lg:hidden" aria-label={t("nav.menu_arialabel")}>
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={locale === "ar" ? "left" : "right"} className="w-[min(320px,84vw)] p-6 pt-16">
                <SheetTitle className="sr-only">{t("nav.menu_arialabel")}</SheetTitle>
                <nav className="flex flex-col gap-1">
                  {NAV.map(({ href, key }) => (
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
                    href="/book"
                    onClick={() => setOpen(false)}
                    className="mt-3 flex items-center gap-2 rounded-full bg-accent px-4 py-3 font-semibold text-white"
                  >
                    <Package className="size-4" />
                    {t("cta.book")}
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
