import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Check, ChevronRight, ShieldCheck, Truck, Palette } from "lucide-react";

import { PRODUCTS } from "@/content/products";
import { PRICING } from "@/content/pricing";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Wrap, Section, SectionHead } from "@/components/site/section";
import { PriceCalculator } from "@/components/site/price-calculator";
import { ProductCard } from "@/components/site/product-card";
import { CtaBand } from "@/components/site/cta-band";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    PRODUCTS.map((p) => ({ locale, slug: p.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug);
  if (!product) return {};

  const t = await getTranslations({ locale });
  const title = `${t(`${product.key}.t`)} — ${t("brand.name")}`;
  const description = t(`${product.key}.d`);

  return {
    title,
    description,
    alternates: {
      canonical: locale === "en" ? `/products/${slug}` : `/${locale}/products/${slug}`,
      languages: { en: `/products/${slug}`, ar: `/ar/products/${slug}` },
    },
    openGraph: { title, description, images: [product.img] },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const product = PRODUCTS.find((p) => p.slug === slug);
  if (!product) notFound();

  const t = await getTranslations();
  const priced = product.pricing ? PRICING.products[product.pricing] : null;
  const related = PRODUCTS.filter((p) => p.cat === product.cat && p.slug !== product.slug).slice(0, 3);

  const title = t(`${product.key}.t`);

  return (
    <>
      {/* JSON-LD so the product is eligible for rich results — impossible on the old flat page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: title,
            description: t(`${product.key}.d`),
            image: product.img,
            brand: { "@type": "Brand", name: t("brand.name") },
            ...(priced && {
              offers: {
                "@type": "AggregateOffer",
                priceCurrency: "EGP",
                lowPrice: Math.min(
                  ...priced.variants.flatMap((v) =>
                    Array.isArray(v.prices)
                      ? (v.prices as number[])
                      : Object.values((v.prices ?? {}) as Record<string, number>),
                  ),
                ),
              },
            }),
          }),
        }}
      />

      <section className="border-b border-line bg-paper-2 py-10 md:py-14">
        <Wrap>
          <div className="mb-5 flex flex-wrap items-center gap-2 text-[0.87rem] text-muted">
            <Link href="/" className="hover:text-accent-2">
              {t("crumb.home")}
            </Link>
            <ChevronRight className="size-3.5 opacity-50 rtl:rotate-180" />
            <Link href="/products" className="hover:text-accent-2">
              {t("nav.products")}
            </Link>
            <ChevronRight className="size-3.5 opacity-50 rtl:rotate-180" />
            <span className="text-ink">{title}</span>
          </div>

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[30px] shadow-deep">
              <Image
                src={product.img}
                alt={title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            <div>
              <span className="inline-flex rounded-full bg-accent-soft px-3 py-1 text-[0.8rem] font-bold text-accent-2">
                {t(`cat.${product.cat}`)}
              </span>
              <h1 className="mt-4 text-[clamp(1.9rem,1.3rem+2.2vw,3rem)]">{title}</h1>
              <p className="mt-4 text-[1.05rem] leading-relaxed text-muted">
                {t(`${product.key}.d`)}
              </p>

              {product.specs.length > 0 && (
                <ul className="mt-6 grid gap-2.5">
                  {product.specs.map((s) => (
                    <li key={s} className="flex items-start gap-2.5">
                      <Check className="mt-1 size-4 shrink-0 text-leaf" />
                      <span>{t(s)}</span>
                    </li>
                  ))}
                </ul>
              )}

              {product.pricing ? (
                <PriceCalculator
                  productId={product.pricing}
                  title={title}
                  defaultOpen
                />
              ) : (
                <div className="mt-6 rounded-card border border-dashed border-line bg-paper p-6">
                  <p className="font-semibold">{t("cta.askprice")}</p>
                  <p className="mt-1 text-[0.9rem] text-muted">{t("band.p")}</p>
                </div>
              )}

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  { icon: ShieldCheck, k: "why.2.t" },
                  { icon: Palette, k: "mq.6" },
                  { icon: Truck, k: "why.4.t" },
                ].map(({ icon: Icon, k }) => (
                  <div key={k} className="flex items-center gap-2.5 rounded-lg bg-paper px-3 py-2.5">
                    <Icon className="size-4 shrink-0 text-accent-2" />
                    <span className="text-[0.86rem] font-semibold">{t(k)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Wrap>
      </section>

      {related.length > 0 && (
        <Section>
          <SectionHead eyebrow={t("prod.eyebrow")} title={t("prod.h2")} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} withPricer={false} showSpecs={false} />
            ))}
          </div>
        </Section>
      )}

      <CtaBand />
    </>
  );
}
