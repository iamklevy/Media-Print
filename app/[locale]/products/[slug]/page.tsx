import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";

import { PRODUCTS, type CatalogueProduct } from "@/content/products";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Wrap, Section, SectionHead } from "@/components/site/section";
import { ProductCard } from "@/components/site/product-card";
import { ProductGallery } from "@/components/site/product-gallery";
import { CtaBand } from "@/components/site/cta-band";
import { Reveal } from "@/components/site/motion";
import { btnPrimary } from "@/components/site/buttons";
import { cn } from "@/lib/utils";

/** Same-category products first, then whichever others share the most industries/types
 * with it — so every product (even a category's sole member, like nonwoven) always
 * gets relevant "you may also like" suggestions instead of an empty section. */
function relatedProducts(product: CatalogueProduct, count = 3): CatalogueProduct[] {
  const score = (p: CatalogueProduct) => {
    const sharedIndustries = p.industries.filter((i) => product.industries.includes(i)).length;
    const sharedTypes = p.types.filter((t) => product.types.includes(t)).length;
    return (p.cat === product.cat ? 100 : 0) + sharedIndustries * 10 + sharedTypes;
  };
  return PRODUCTS.filter((p) => p.slug !== product.slug)
    .sort((a, b) => score(b) - score(a))
    .slice(0, count);
}

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
    openGraph: { title, description, images: [product.images[0]] },
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
  const related = relatedProducts(product);

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
            image: product.images,
            brand: { "@type": "Brand", name: t("brand.name") },
          }),
        }}
      />

      <section className="pb-16 pt-8 md:pb-24 md:pt-12">
        <Wrap>
          <Link
            href="/products"
            className="mb-8 inline-flex items-center gap-1.5 text-[0.9rem] font-semibold text-muted transition-colors hover:text-accent"
          >
            <ArrowLeft className="size-4 rtl:rotate-180" />
            {t("nav.browse")}
          </Link>

          <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
            <ProductGallery images={product.images} alt={title} />

            <Reveal y={16}>
              <h1 className="font-display text-[clamp(2rem,1.4rem+2.4vw,3.2rem)] text-balance rtl:text-[clamp(2.3rem,1.6rem+2.6vw,3.5rem)]">
                {title}
              </h1>
              <p className="mt-4 max-w-[52ch] text-[1.02rem] leading-relaxed text-muted">{t(`${product.key}.d`)}</p>

              {product.specs.length > 0 && (
                <ul className="mt-8 grid max-w-[52ch] border-t border-line">
                  {product.specs.map((s) => (
                    <li key={s} className="border-b border-line py-3 text-[0.95rem] text-ink-2">
                      {t(s)}
                    </li>
                  ))}
                </ul>
              )}

              <Link href={`/contact?product=${encodeURIComponent(title)}`} className={cn(btnPrimary, "mt-9")}>
                {t("cta.quote")}
              </Link>
            </Reveal>
          </div>
        </Wrap>
      </section>

      {related.length > 0 && (
        <Section tint>
          <SectionHead title={t("prod.related.h2")} />
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </Section>
      )}

      <CtaBand />
    </>
  );
}
