"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/orders/status-badge";
import { daysUntil } from "@/lib/orders/due";
import { NEEDS_ACTION } from "@/lib/orders/status";
import type { OrderWithStatus } from "@/components/ops/ops-dashboard";

const DAY_MS = 86_400_000;
/** Rows shown per list before "Show all" — keeps the page short on phones. */
const PREVIEW_ROWS = 12;

/** Overdue first (latest-running first), then by delivery date; undated jobs last. */
function byUrgency(a: OrderWithStatus, b: OrderWithStatus): number {
  const rank = (x: OrderWithStatus) => (x.status === "overdue" ? 0 : 1);
  if (rank(a) !== rank(b)) return rank(a) - rank(b);
  const da = a.order.estimated_delivery ?? "9999";
  const db = b.order.estimated_delivery ?? "9999";
  return da.localeCompare(db);
}

export function OpsQueue({
  items,
  now,
  onOpenOrder,
}: {
  items: OrderWithStatus[];
  now: number;
  onOpenOrder: (id: string) => void;
}) {
  const t = useTranslations("ops");
  const tPhase = useTranslations("track.phase");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const needsAction = items.filter(({ status }) => NEEDS_ACTION.includes(status)).sort(byUrgency);
  // Longest-waiting first: those are the customers most worth a nudge.
  const waiting = items
    .filter(({ status }) => status === "waiting_on_customer")
    .sort((a, b) => a.order.updated_at.localeCompare(b.order.updated_at));

  function dueLabel({ order, status }: OrderWithStatus): { text: string; tone: string } {
    if (status === "waiting_on_customer") {
      const days = Math.max(0, Math.floor((now - new Date(order.updated_at).getTime()) / DAY_MS));
      return { text: t("queue.waiting_for", { days }), tone: days >= 3 ? "text-amber" : "text-muted" };
    }
    if (!order.estimated_delivery) return { text: t("queue.no_due"), tone: "text-faint" };
    const days = daysUntil(order.estimated_delivery, now);
    if (days < 0) return { text: t("overdue_by", { days: -days }), tone: "text-danger" };
    return { text: t("queue.due_in", { days }), tone: days <= 1 ? "text-accent-2" : "text-muted" };
  }

  const sections = [
    { key: "needs_action", items: needsAction },
    { key: "waiting", items: waiting },
  ] as const;

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:items-start">
      {sections.map((section) => (
        <section key={section.key} className="glass min-w-0 rounded-[24px] p-2.5 sm:rounded-[28px] sm:p-4">
          <header className="flex items-start justify-between gap-3 px-2 pt-1 pb-3">
            <div>
              <h2 className="text-base font-bold">{t(`queue.${section.key}`)}</h2>
              <p className="mt-0.5 text-xs leading-snug text-muted">{t(`queue.${section.key}_hint`)}</p>
            </div>
            <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-bold tabular-nums shadow-soft">
              {section.items.length}
            </span>
          </header>

          <ul className="grid grid-cols-1 gap-1.5">
            {(expanded[section.key] ? section.items : section.items.slice(0, PREVIEW_ROWS)).map((item) => {
              const { order, status } = item;
              const due = dueLabel(item);
              return (
                <li key={order.id}>
                  <button
                    type="button"
                    onClick={() => onOpenOrder(order.id)}
                    className="group flex w-full items-center gap-2.5 rounded-[18px] border border-white/80 bg-white/75 px-3 py-3 text-start shadow-soft transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-lift sm:gap-3 sm:px-3.5"
                  >
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="flex items-center gap-2">
                        <span className="shrink-0 text-sm font-bold">{order.order_number}</span>
                        <span className="truncate text-sm text-muted">{order.customer_name}</span>
                      </span>
                      <span className="mt-1 block truncate text-xs text-ink-2/80">
                        {order.product_label} · {tPhase(order.phase)}
                      </span>
                    </span>
                    <StatusBadge status={status} className="hidden sm:inline-flex" />
                    <span className={cn("max-w-24 shrink-0 text-end text-xs leading-tight font-semibold sm:max-w-none", due.tone)}>
                      {due.text}
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-faint rtl:-scale-x-100" />
                  </button>
                </li>
              );
            })}
            {section.items.length === 0 && (
              <p className="rounded-2xl border border-dashed border-ink/10 px-3 py-8 text-center text-sm text-muted">
                {t("queue.empty")}
              </p>
            )}
          </ul>
          {!expanded[section.key] && section.items.length > PREVIEW_ROWS && (
            <button
              type="button"
              onClick={() => setExpanded((prev) => ({ ...prev, [section.key]: true }))}
              className="mt-2 w-full rounded-full bg-white/70 py-2.5 text-sm font-semibold text-ink-2 shadow-soft transition-colors hover:bg-white"
            >
              {t("queue.show_all", { count: section.items.length })}
            </button>
          )}
        </section>
      ))}
    </div>
  );
}
