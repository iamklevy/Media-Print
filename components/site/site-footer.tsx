import { useTranslations } from "next-intl";
import { ArrowRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "./brand-icons";

import { Link } from "@/i18n/navigation";
import {
  SALES_PHONE,
  SALES_PHONE_2,
  WHATSAPP_PHONE,
  ADMIN_PHONE,
  formatPhone,
  FOOTER_EMAIL,
  FACEBOOK,
  INSTAGRAM,
} from "@/lib/contact";
import { BESTSELLERS, PRODUCTS } from "@/content/products";
import { cn } from "@/lib/utils";
import { FooterLangLink } from "./footer-lang-link";

const SITE = [
  { href: "/", key: "home" },
  { href: "/products", key: "products" },
  { href: "/services", key: "finishing" },
  { href: "/bestsellers", key: "portfolio" },
  { href: "/about", key: "about" },
  { href: "/faq", key: "faq" },
  { href: "/book", key: "book" },
  { href: "/contact", key: "contact" },
] as const;

// the six most-ordered products; the full list lives one click away on /products
const TOP_PRODUCTS = BESTSELLERS.map((slug) => PRODUCTS.find((p) => p.slug === slug)).filter(
  (p): p is (typeof PRODUCTS)[number] => Boolean(p),
);

/** deep berry-brown: the brand berry (#8b3343) taken almost to night */
const FOOTER_BG = "#2a0f16";

// cream text in three strengths; links brighten and underline on hover, no extra colours
const LINK =
  "text-paper/65 underline-offset-4 decoration-paper/40 transition-colors hover:text-paper hover:underline";
const HEAD = "mb-5 font-display text-[1.2rem] text-paper rtl:text-[1.3rem]";
const ROUND =
  "grid size-10 place-items-center rounded-full border border-paper/20 text-paper/80 transition-colors hover:border-paper hover:bg-paper hover:text-[#2a0f16]";

/**
 * The site footer, in the redesign's language: a deep berry ground (so the
 * pink closing band above settles into it rather than slamming into black),
 * a soft rose glow along the top edge, the display serif for the headline and
 * column titles, round outline icons like the catalogue's filter chips, and
 * cream text that brightens on hover. Three columns from lg; on phones Explore
 * and Products sit side by side and Get in touch runs full width below.
 */
export function SiteFooter() {
  const t = useTranslations();

  return (
    <footer
      style={{
        backgroundColor: FOOTER_BG,
        backgroundImage: `radial-gradient(ellipse 60% 120px at 50% 0%, rgba(248,207,199,0.16), transparent)`,
      }}
      className="text-paper/65"
    >
      <div className="mx-auto w-[min(1200px,100%-2.5rem)] pt-16 md:pt-24">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_2fr] lg:gap-16">
          {/* ---- brand: logo, the serif line, what we do, socials */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-[10px] bg-paper p-[3px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="" className="size-full object-contain" />
              </span>
              <span className="text-[1rem] font-bold text-paper">{t("brand.name")}</span>
            </Link>
            <p className="mt-6 w-fit font-display text-[clamp(1.6rem,1.25rem+1.2vw,2.1rem)] text-paper rtl:text-[clamp(1.8rem,1.4rem+1.4vw,2.35rem)]">
              {t("ft.headline")}
              {/* the signature: handwritten, in the hero's rose, signed just after the heading */}
              <span className="font-signature ms-2 inline-block -rotate-3 whitespace-nowrap text-[0.65em] text-[#f4a99c] rtl:rotate-0 rtl:text-[0.58em]">
                {t("ft.signature")}
              </span>
            </p>
            <p className="mt-4 max-w-[42ch] text-[0.88rem] leading-relaxed">{t("ft.about")}</p>

            <div role="group" aria-label={t("ft.social")} className="mt-7 flex items-center gap-2">
              <a href={FACEBOOK} target="_blank" rel="noopener" aria-label={t("ft.fb_arialabel")} className={ROUND}>
                <FacebookIcon className="size-[18px]" />
              </a>
              <a href={INSTAGRAM} target="_blank" rel="noopener" aria-label={t("ft.in_arialabel")} className={ROUND}>
                <InstagramIcon className="size-[18px]" />
              </a>
              <a
                href={`https://wa.me/20${WHATSAPP_PHONE}`}
                target="_blank"
                rel="noopener"
                aria-label={t("ft.wa_arialabel")}
                className={ROUND}
              >
                <WhatsAppIcon className="size-[18px]" />
              </a>
            </div>
          </div>

          {/* ---- link columns */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-[0.8fr_1fr_1.35fr]">
            <nav aria-label={t("ft.nav")}>
              <h2 className={HEAD}>{t("ft.nav")}</h2>
              <ul className="grid gap-3 text-[0.95rem]">
                {SITE.map(({ href, key }) => (
                  <li key={href}>
                    <Link href={href} className={LINK}>
                      {t(`nav.${key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <h2 className={HEAD}>{t("ft.prod")}</h2>
              <ul className="grid gap-3 text-[0.95rem]">
                {TOP_PRODUCTS.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/products/${p.slug}`} className={LINK}>
                      {t(`${p.key}.t`)}
                    </Link>
                  </li>
                ))}
                <li className="mt-1">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-1.5 font-semibold text-paper underline-offset-4 transition hover:underline"
                  >
                    {t("ft.all_products")}
                    <ArrowRight className="size-4 rtl:-scale-x-100" />
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-2 md:col-span-1">
              <h2 className={HEAD}>{t("ft.contact")}</h2>
              <ul className="grid gap-4 text-[0.95rem]">
                <ContactRow icon={Phone}>
                  <span className="block text-[0.82rem] text-paper/45">{t("ft.sales")}</span>
                  {/* only the numbers are LTR; the row follows the page direction, so in
                      Arabic it lines up on the right like every other line here */}
                  <span className="flex flex-wrap gap-x-2">
                    <a href={`tel:+2${SALES_PHONE}`} dir="ltr" className={LINK}>
                      {formatPhone(SALES_PHONE)}
                    </a>
                    <span className="text-paper/30">/</span>
                    <a href={`tel:+2${SALES_PHONE_2}`} dir="ltr" className={LINK}>
                      {formatPhone(SALES_PHONE_2)}
                    </a>
                  </span>
                </ContactRow>
                <ContactRow icon={Phone}>
                  <span className="block text-[0.82rem] text-paper/45">{t("ft.inquiries")}</span>
                  <a href={`tel:+2${ADMIN_PHONE}`} dir="ltr" className={LINK}>
                    {formatPhone(ADMIN_PHONE)}
                  </a>
                </ContactRow>
                <ContactRow icon={Mail}>
                  <a href={`mailto:${FOOTER_EMAIL}`} dir="ltr" className={cn(LINK, "break-all")}>
                    {FOOTER_EMAIL}
                  </a>
                </ContactRow>
                <ContactRow icon={MapPin}>{t("c.addr.v")}</ContactRow>
                <ContactRow icon={Clock}>{t("c.hours.v")}</ContactRow>
              </ul>
            </div>
          </div>
        </div>

        {/* ---- bottom strip */}
        <div className="mt-16 flex flex-col gap-4 border-t border-paper/10 py-7 text-[0.85rem] text-paper/50 sm:flex-row sm:items-center sm:justify-between md:mt-20">
          <span>{t("ft.rights")}</span>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <FooterLangLink className="inline-flex items-center gap-1.5 font-semibold text-paper/75 transition-colors hover:text-paper" />
            <span>
              {t.rich("ft.credit", {
                link: (chunks) => (
                  <a
                    href="https://portfolio-green-nine-36.vercel.app/"
                    target="_blank"
                    rel="noopener"
                    className="font-semibold text-paper/75 underline-offset-4 transition hover:text-paper hover:underline"
                  >
                    {chunks}
                  </a>
                ),
              })}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function ContactRow({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <Icon className="mt-[3px] size-4 shrink-0 text-paper/40" />
      <div className="min-w-0">{children}</div>
    </li>
  );
}
