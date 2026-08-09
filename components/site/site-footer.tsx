import { useTranslations } from "next-intl";
import { Phone } from "lucide-react";
import { FacebookIcon, WhatsAppIcon } from "./brand-icons";

import { Link } from "@/i18n/navigation";
import {
  SALES_PHONE,
  ADMIN_PHONE,
  EMAIL,
  FACEBOOK,
} from "@/lib/contact";

const SITE = [
  { href: "/", key: "home" },
  { href: "/bestsellers", key: "best" },
  { href: "/products", key: "products" },
  { href: "/stickers", key: "stickers" },
  { href: "/services", key: "services" },
  { href: "/book", key: "book" },
  { href: "/contact", key: "contact" },
] as const;

const PRODUCTS = [
  { href: "/products/zipper", key: "p.zipper.t" },
  { href: "/products/paper-sacks", key: "p.sacks.t" },
  { href: "/products/courier", key: "p.courier.t" },
  { href: "/products/cartons", key: "p.cartons.t" },
  { href: "/products/nonwoven", key: "p.nonwoven.t" },
] as const;

export function SiteFooter() {
  const t = useTranslations();

  return (
    <footer className="bg-ink pt-12 text-paper/70 md:pt-16">
      <div className="mx-auto w-[min(1200px,100%-2.5rem)]">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr] lg:gap-12">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-white p-[3px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="" className="size-full object-contain" />
              </span>
              <span className="text-[1.06rem] font-extrabold text-paper">
                {t("brand.name")}
              </span>
            </Link>
            <p className="mt-4 max-w-[34ch] text-[0.92rem]">{t("ft.about")}</p>
            <div className="mt-5 flex gap-2">
              <a
                href={FACEBOOK}
                target="_blank"
                rel="noopener"
                aria-label={t("ft.fb_arialabel")}
                className="grid size-10 place-items-center rounded-xl bg-white/10 text-paper transition hover:bg-accent"
              >
                <FacebookIcon className="size-5" />
              </a>
              <a
                href={`https://wa.me/20${SALES_PHONE}`}
                target="_blank"
                rel="noopener"
                aria-label={t("ft.wa_arialabel")}
                className="grid size-10 place-items-center rounded-xl bg-white/10 text-paper transition hover:bg-accent"
              >
                <WhatsAppIcon className="size-5" />
              </a>
              <a
                href={`tel:+2${SALES_PHONE}`}
                aria-label={t("ft.tel_arialabel")}
                className="grid size-10 place-items-center rounded-xl bg-white/10 text-paper transition hover:bg-accent"
              >
                <Phone className="size-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-[0.95rem] font-bold text-paper">{t("ft.nav")}</h4>
            <ul className="grid gap-2.5 text-[0.93rem]">
              {SITE.map(({ href, key }) => (
                <li key={href}>
                  <Link href={href} className="transition hover:text-accent">
                    {t(`nav.${key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-[0.95rem] font-bold text-paper">{t("ft.prod")}</h4>
            <ul className="grid gap-2.5 text-[0.93rem]">
              {PRODUCTS.map(({ href, key }) => (
                <li key={href}>
                  <Link href={href} className="transition hover:text-accent">
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-[0.95rem] font-bold text-paper">{t("ft.contact")}</h4>
            <ul className="grid gap-2.5 text-[0.93rem]">
              <li>
                <a href={`tel:+2${SALES_PHONE}`} dir="ltr" className="transition hover:text-accent">
                  {SALES_PHONE}
                </a>
              </li>
              <li>
                <a href={`tel:+2${ADMIN_PHONE}`} dir="ltr" className="transition hover:text-accent">
                  {ADMIN_PHONE}
                </a>
              </li>
              <li>
                <a href={`mailto:${EMAIL}`} dir="ltr" className="transition hover:text-accent">
                  {EMAIL}
                </a>
              </li>
              <li>{t("c.addr.v")}</li>
              <li>{t("c.hours.v")}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap justify-between gap-4 border-t border-white/10 py-6 text-[0.85rem]">
          <span>{t("ft.rights")}</span>
          <span>{t("ft.made")}</span>
        </div>
      </div>
    </footer>
  );
}
