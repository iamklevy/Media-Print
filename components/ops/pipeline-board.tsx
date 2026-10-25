"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { OrderCard } from "@/components/ops/order-card";
import { KANBAN_COLUMNS } from "@/lib/orders/phases";
import { NEEDS_ACTION } from "@/lib/orders/status";
import type { OrderWithStatus } from "@/components/ops/ops-dashboard";

// "all" shows every order (cancelled ones keep their column, with a Cancelled pill);
// the other tabs are filters, "cancelled" lists only cancelled orders.
export type PipelineFilter = "all" | "needs_action" | "waiting" | "overdue" | "cancelled";

/** Cards rendered per stage before "Show all" — 96 cards in one stage is a 10,000px phone page. */
const MOBILE_PREVIEW = 20;

const FILTERS: PipelineFilter[] =["all", "needs_action", "waiting", "overdue", "cancelled"];

export function PipelineBoard({
  items,
  filter,
  onFilterChange,
  now,
  onOpenOrder,
}: {
  items: OrderWithStatus[];
  filter: PipelineFilter;
  onFilterChange: (filter: PipelineFilter) => void;
  now: number;
  onOpenOrder: (id: string) => void;
}) {
  const t = useTranslations("ops");
  // Below lg there's no room for six columns side by side, so the board shows
  // one stage at a time, picked from the chip row.
  const [stage, setStage] = useState<string>(KANBAN_COLUMNS[0].title);
  const [showAll, setShowAll] = useState(false);

  const visible = items.filter(({ status }) => {
    if (filter === "cancelled") return status === "cancelled";
    if (filter === "needs_action") return NEEDS_ACTION.includes(status);
    if (filter === "waiting") return status === "waiting_on_customer";
    if (filter === "overdue") return status === "overdue";
    return true;
  });

  const columns = KANBAN_COLUMNS.map((col) => ({
    title: col.title,
    items: visible.filter(({ order }) => col.phases.includes(order.phase)),
  }));

  return (
    <>
      <div className="-mx-4 touch-pan-x overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0 lg:shrink-0 lg:pb-4">
        <div role="tablist" className="glass inline-flex gap-1 rounded-full p-1">
          {FILTERS.map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filter === key}
              onClick={() => onFilterChange(key)}
              className={cn(
                "rounded-full px-4 py-1.5 text-[0.8rem] font-semibold whitespace-nowrap transition-colors",
                filter === key
                  ? "bg-linear-to-r from-accent to-accent-2 text-white shadow-[0_6px_16px_-6px_rgb(221_99_32/0.7)]"
                  : "text-ink-2/75 hover:bg-white/60 hover:text-ink"
              )}
            >
              {t(`tabs.${key}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="-mx-4 flex touch-pan-x gap-2 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0 lg:hidden">
        {columns.map((col) => (
          <button
            key={col.title}
            type="button"
            onClick={() => {
              setStage(col.title);
              setShowAll(false);
            }}
            aria-pressed={stage === col.title}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-[0.8rem] font-semibold whitespace-nowrap transition-colors",
              stage === col.title ? "bg-ink text-paper shadow-lift" : "glass text-ink-2"
            )}
          >
            {t(`columns.${col.title}`)}
            <span
              className={cn(
                "rounded-full px-1.5 text-[0.7rem] leading-5 font-bold tabular-nums",
                stage === col.title ? "bg-paper/15" : "bg-white/80"
              )}
            >
              {col.items.length}
            </span>
          </button>
        ))}
      </div>

      <div className="grid gap-3 lg:flex lg:min-h-0 lg:flex-1 lg:gap-2.5 lg:overflow-x-auto">
        {columns.map((col) => (
          <section
            key={col.title}
            className={cn(
              "glass flex-col gap-3 rounded-[24px] p-3 lg:flex lg:min-h-0 lg:min-w-[180px] lg:flex-1",
              stage === col.title ? "flex" : "hidden"
            )}
          >
            <header className="flex items-center justify-between px-1.5 pt-1 lg:shrink-0">
              <h2 className="text-sm font-bold">{t(`columns.${col.title}`)}</h2>
              <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-bold tabular-nums shadow-soft">
                {col.items.length}
              </span>
            </header>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-y-auto lg:pe-0.5 lg:[scrollbar-width:thin]">
              {(showAll ? col.items : col.items.slice(0, MOBILE_PREVIEW)).map(({ order }) => (
                <OrderCard key={order.id} order={order} now={now} onClick={() => onOpenOrder(order.id)} />
              ))}
              {col.items.length === 0 && (
                <p className="rounded-2xl border border-dashed border-ink/10 px-3 py-6 text-center text-xs text-faint sm:col-span-2">
                  {t("empty_column")}
                </p>
              )}
            </div>
            {!showAll && col.items.length > MOBILE_PREVIEW && (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="w-full rounded-full bg-white/70 py-2.5 text-sm font-semibold text-ink-2 shadow-soft transition-colors hover:bg-white"
              >
                {t("queue.show_all", { count: col.items.length })}
              </button>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
