"use client";

import { useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Grid2x2, Grid3x3, X } from "lucide-react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { ProductCard } from "./product-card";
import type { CatalogueProduct } from "@/content/products";
import { INDUSTRIES, SOLUTION_TYPES } from "@/content/industries";
import { cn } from "@/lib/utils";

const INDUSTRY_SLUGS = INDUSTRIES.map((i) => i.slug);

// filter pills: one swipeable row on phones, centred and wrapping from sm up
const CHIP = "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-[0.9rem] font-semibold transition-colors";
const CHIP_ON = "border-accent bg-accent text-white";
const CHIP_OFF = "border-ink/15 bg-white/50 text-ink hover:border-ink/30 hover:bg-white/80";

// grid density: "large" is 1 / 2 / 3 columns (phone / tablet / desktop),
// "compact" is 2 / 3 / 4. A visitor who hasn't picked one gets "auto": compact
// on phones (2 columns), large from sm up. It's pure CSS, so the server render
// is already right for every screen. A pick is kept in localStorage.
type View = "large" | "compact";
type ViewState = View | "auto";
const VIEW_KEY = "mp.catalogue.view";
const GRID: Record<ViewState, string> = {
  large: "grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-14",
  compact: "grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 lg:gap-y-10",
  auto: "grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-14",
};
const PHONE_MQ = "(max-width: 639.98px)";
const VIEW_BTN = "grid size-9 place-items-center rounded-full transition-colors";

const viewListeners = new Set<() => void>();
function readView(): ViewState {
  try {
    const saved = localStorage.getItem(VIEW_KEY);
    return saved === "compact" || saved === "large" ? saved : "auto";
  } catch {
    return "auto";
  }
}
function writeView(v: View) {
  try {
    localStorage.setItem(VIEW_KEY, v);
  } catch {}
  viewListeners.forEach((l) => l());
}
function subscribeView(l: () => void) {
  viewListeners.add(l);
  return () => viewListeners.delete(l);
}
function subscribePhone(l: () => void) {
  const mq = window.matchMedia(PHONE_MQ);
  mq.addEventListener("change", l);
  return () => mq.removeEventListener("change", l);
}

/**
 * The catalogue with its filter pills. The URL is the single source of truth,
 * so a filtered view can be shared or bookmarked and Back works:
 * - `?industry=<slug>`: one of the industry pills.
 * - `?type=<slug>`: a product type, set by the homepage "What we make" tiles.
 *   It shows as its own selected pill (with × to clear) so it's never hidden.
 * Picking a pill replaces the whole filter, so the two never stack into an
 * empty "flyers AND cosmetics" view.
 */
export function ProductGrid({ products }: { products: CatalogueProduct[] }) {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const view = useSyncExternalStore(subscribeView, readView, () => "auto" as ViewState);
  const isPhone = useSyncExternalStore(subscribePhone, () => window.matchMedia(PHONE_MQ).matches, () => false);
  // which toggle button shows as selected; "auto" means whatever this screen gets
  const active: View = view === "auto" ? (isPhone ? "compact" : "large") : view;

  const industryParam = searchParams.get("industry");
  const industry = industryParam && INDUSTRY_SLUGS.includes(industryParam) ? industryParam : null;
  const typeParam = searchParams.get("type");
  const type = SOLUTION_TYPES.find((s) => s.slug === typeParam) ?? null;

  function show(query: Record<string, string>) {
    router.replace({ pathname, query }, { scroll: false });
  }

  const shown = products.filter((p) => {
    if (industry && !p.industries.includes(industry)) return false;
    if (type && !p.types.includes(type.slug)) return false;
    return true;
  });

  return (
    <>
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          aria-pressed={!industry && !type}
          onClick={() => show({})}
          className={cn(CHIP, !industry && !type ? CHIP_ON : CHIP_OFF)}
        >
          {t("industry.all")}
        </button>

        {type && (
          <button
            type="button"
            aria-pressed
            onClick={() => show({})}
            aria-label={`${t(type.key)} ×`}
            className={cn(CHIP, CHIP_ON)}
          >
            {t(type.key)}
            <X className="size-3.5" />
          </button>
        )}

        {INDUSTRIES.map((ind) => (
          <button
            key={ind.slug}
            type="button"
            aria-pressed={industry === ind.slug}
            onClick={() => show({ industry: ind.slug })}
            className={cn(CHIP, industry === ind.slug ? CHIP_ON : CHIP_OFF)}
          >
            {t(`${ind.key}.name`)}
          </button>
        ))}
      </div>

      {/* how many products the current filter shows; announced when it changes */}
      <div className="mb-5 mt-10 flex items-center justify-between gap-4 md:mt-14">
        <p aria-live="polite" className="text-start text-[0.9rem] text-muted">
          {t("cat.count", { n: shown.length })}
        </p>
        <div role="group" aria-label={t("cat.view")} className="flex gap-1 rounded-full border border-ink/15 bg-white/50 p-1">
          {(
            [
              ["large", Grid2x2, t("cat.viewLarge")],
              ["compact", Grid3x3, t("cat.viewCompact")],
            ] as const
          ).map(([v, Icon, label]) => (
            <button
              key={v}
              type="button"
              aria-pressed={active === v}
              aria-label={label}
              title={label}
              onClick={() => writeView(v)}
              className={cn(VIEW_BTN, active === v ? "bg-accent text-white" : "text-ink/60 hover:text-ink")}
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>
      </div>

      {shown.length > 0 ? (
        <div className={cn("grid", GRID[view])}>
          {shown.map((p) => (
            <ProductCard key={p.slug} product={p} variant={view} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted">{t("cat.empty")}</p>
      )}
    </>
  );
}
