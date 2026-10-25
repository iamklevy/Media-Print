"use client";

import type { CSSProperties, ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowRight,
  ArrowUpRight,
  Ban,
  BellRing,
  ChevronRight,
  CircleCheck,
  MessageSquareWarning,
  PackagePlus,
  RotateCcw,
  Star,
  StickyNote,
  type LucideIcon,
} from "lucide-react";

import { cn, formatRelativeDay } from "@/lib/utils";
import { KANBAN_COLUMNS } from "@/lib/orders/phases";
import { daysUntil, parseDay, startOfDay } from "@/lib/orders/due";
import type { OrderStatus } from "@/lib/orders/status";
import type { ActivityItem } from "@/lib/orders/ops-feed";
import type { OrderEvent } from "@/lib/orders/types";
import type { OrderWithStatus } from "@/components/ops/ops-dashboard";
import type { PipelineFilter } from "@/components/ops/pipeline-board";

type Tint = "accent" | "amber" | "danger" | "leaf" | "none";

const TINTS: Record<Tint, string> = {
  accent: "radial-gradient(130% 100% at 100% 0%, rgb(221 99 32 / 0.24), transparent 62%)",
  amber: "radial-gradient(130% 100% at 100% 0%, rgb(232 160 40 / 0.28), transparent 62%)",
  danger: "radial-gradient(130% 100% at 100% 0%, rgb(214 60 50 / 0.2), transparent 62%)",
  leaf: "radial-gradient(130% 100% at 100% 0%, rgb(47 140 95 / 0.22), transparent 62%)",
  none: "none",
};

const STATUS_DOT: Record<OrderStatus, string> = {
  done: "bg-leaf",
  in_progress: "bg-accent",
  waiting_on_customer: "bg-amber",
  overdue: "bg-danger",
  not_started: "bg-faint",
  cancelled: "bg-ink-2/40",
};

const EVENT_ICON: Record<OrderEvent["type"], { icon: LucideIcon; tone: string }> = {
  created: { icon: PackagePlus, tone: "bg-accent-soft text-accent-2" },
  phase_change: { icon: ArrowRight, tone: "bg-accent-soft text-accent-2" },
  customer_approved: { icon: CircleCheck, tone: "bg-leaf-soft text-leaf" },
  customer_requested_changes: { icon: MessageSquareWarning, tone: "bg-amber-soft text-amber" },
  reminder_sent: { icon: BellRing, tone: "bg-paper-2 text-ink-2" },
  rated: { icon: Star, tone: "bg-amber-soft text-amber" },
  note: { icon: StickyNote, tone: "bg-paper-2 text-ink-2" },
  cancelled: { icon: Ban, tone: "bg-danger-soft text-danger" },
  reopened: { icon: RotateCcw, tone: "bg-leaf-soft text-leaf" },
};

const WAITING_GATES = [
  { key: "quote", phase: "quote_review" },
  { key: "artwork", phase: "artwork_approved" },
  { key: "sample", phase: "sample_approved" },
] as const;

const WEEK_DAYS = 7;
const TIMELINE_LIST_LIMIT = 5;

export function OpsHome({
  items,
  activity,
  now,
  onOpenOrder,
  onOpenPipeline,
  onOpenQueue,
}: {
  items: OrderWithStatus[];
  activity: ActivityItem[];
  now: number;
  onOpenOrder: (id: string) => void;
  onOpenPipeline: (filter: PipelineFilter) => void;
  onOpenQueue: () => void;
}) {
  const t = useTranslations("ops");
  const tPhase = useTranslations("track.phase");
  const locale = useLocale();
  const dateLocale = locale === "ar" ? "ar-EG" : "en-US";

  const live = items.filter(({ order }) => order.phase !== "delivered" && !order.cancelled_at);
  const waiting = items.filter(({ status }) => status === "waiting_on_customer");
  const overdue = items.filter(({ status }) => status === "overdue");
  const worstOverdue = Math.max(0, ...overdue.map(({ order }) => -daysUntil(order.estimated_delivery!, now)));
  const deliveredRecently = items.filter(
    ({ order }) => order.delivered_at && now - new Date(order.delivered_at).getTime() <= 30 * 86_400_000
  ).length;
  const rated = items.filter(({ order }) => order.rating != null);
  const avgRating = rated.length ? rated.reduce((sum, { order }) => sum + (order.rating ?? 0), 0) / rated.length : null;

  const columnCounts = KANBAN_COLUMNS.map((col) => ({
    title: col.title,
    items: live.filter(({ order }) => col.phases.includes(order.phase)),
  }));
  const maxColumn = Math.max(1, ...columnCounts.map((c) => c.items.length));

  // Live orders with a delivery date in the next 7 days (today included), soonest first.
  const dueThisWeek = live
    .filter(({ order }) => {
      if (!order.estimated_delivery) return false;
      const days = daysUntil(order.estimated_delivery, now);
      return days >= 0 && days < WEEK_DAYS;
    })
    .sort((a, b) => a.order.estimated_delivery!.localeCompare(b.order.estimated_delivery!));
  const weekDays = Array.from({ length: WEEK_DAYS }, (_, i) => {
    const date = startOfDay(now);
    date.setDate(date.getDate() + i);
    return { date, items: dueThisWeek.filter(({ order }) => daysUntil(order.estimated_delivery!, now) === i) };
  });
  const maxDay = Math.max(1, ...weekDays.map((d) => d.items.length));

  const weekdayFmt = new Intl.DateTimeFormat(dateLocale, { weekday: "short" });
  const dayLabels = { today: t("detail.today"), yesterday: t("detail.yesterday") };

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      {/* Pipeline at a glance — the hero panel, where the reference puts its body map. */}
      <section className="glass flex flex-col rounded-[24px] p-4 sm:rounded-[28px] sm:p-6 xl:col-span-4">
        <PanelHeader
          title={t("home.pipeline_title")}
          sub={t("home.pipeline_hint", { count: live.length })}
          onOpen={() => onOpenPipeline("all")}
          openLabel={t("home.view_all")}
        />
        <ol className="mt-5 grid flex-1 grid-cols-1 content-between gap-1">
          {columnCounts.map((col, i) => {
            const late = col.items.filter(({ status }) => status === "overdue").length;
            const blocked = col.items.filter(({ status }) => status === "waiting_on_customer").length;
            return (
              <li key={col.title}>
                <button
                  type="button"
                  onClick={() => onOpenPipeline("all")}
                  className="group flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-start transition-colors hover:bg-white/60"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/90 text-xs font-bold text-ink-2 shadow-soft">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-semibold">{t(`columns.${col.title}`)}</span>
                      <span className="text-lg leading-none font-bold tabular-nums">{col.items.length}</span>
                    </span>
                    <span className="mt-1.5 flex h-1.5 overflow-hidden rounded-full bg-ink/[0.06]">
                      <span
                        className="h-full rounded-full bg-linear-to-r from-accent to-[#f0a15e] transition-[width] duration-500"
                        style={{ width: `${(col.items.length / maxColumn) * 100}%` }}
                      />
                    </span>
                    {(late > 0 || blocked > 0) && (
                      <span className="mt-1 flex gap-3 text-[0.7rem] leading-tight font-semibold">
                        {late > 0 && <span className="text-danger">{t("home.stage_late", { count: late })}</span>}
                        {blocked > 0 && <span className="text-amber">{t("home.stage_waiting", { count: blocked })}</span>}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="order-first grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:order-none xl:col-span-8">
        <StatTile label={t("home.tile_live")} value={live.length} tint="accent" onClick={() => onOpenPipeline("all")}>
          <div className="flex h-10 items-end gap-1.5">
            {columnCounts.map((col) => (
              <span
                key={col.title}
                title={t(`columns.${col.title}`)}
                className="flex-1 rounded-t-md bg-accent/70"
                style={{ height: `${Math.max(8, (col.items.length / maxColumn) * 100)}%` }}
              />
            ))}
          </div>
        </StatTile>

        <StatTile
          label={t("home.tile_waiting")}
          value={waiting.length}
          tint="amber"
          onClick={() => onOpenPipeline("waiting")}
        >
          <dl className="grid gap-1 text-xs">
            {WAITING_GATES.map((gate) => (
              <div key={gate.key} className="flex justify-between gap-2">
                <dt className="text-muted">{t(`home.waiting_${gate.key}`)}</dt>
                <dd className="font-bold tabular-nums">
                  {waiting.filter(({ order }) => order.phase === gate.phase).length}
                </dd>
              </div>
            ))}
          </dl>
        </StatTile>

        <StatTile
          label={t("home.tile_overdue")}
          value={overdue.length}
          tint={overdue.length ? "danger" : "none"}
          onClick={() => onOpenPipeline("overdue")}
        >
          <p className={cn("text-xs font-semibold", overdue.length ? "text-danger" : "text-leaf")}>
            {overdue.length ? t("home.overdue_worst", { days: worstOverdue }) : t("home.overdue_none")}
          </p>
        </StatTile>

        <StatTile label={t("home.tile_due_week")} value={dueThisWeek.length} tint="none" onClick={onOpenQueue}>
          <div className="flex h-10 items-end gap-1.5">
            {weekDays.map((day, i) => (
              <span key={i} className="flex h-full flex-1 flex-col justify-end">
                <span
                  className={cn("rounded-t-md", i === 0 ? "bg-ink" : "bg-ink/25")}
                  style={{ height: `${Math.max(8, (day.items.length / maxDay) * 100)}%` }}
                />
              </span>
            ))}
          </div>
        </StatTile>

        <StatTile label={t("home.tile_delivered")} value={deliveredRecently} tint="leaf" onClick={() => onOpenPipeline("all")}>
          <p className="text-xs font-semibold text-leaf">{t("home.delivered_note")}</p>
        </StatTile>

        <StatTile
          label={t("home.tile_rating")}
          value={avgRating != null ? avgRating.toFixed(1) : "—"}
          tint={avgRating != null ? "amber" : "none"}
        >
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
            <Stars value={avgRating ?? 0} />
            <span className="text-xs text-muted">
              {rated.length ? t("home.rating_count", { count: rated.length }) : t("home.rating_none")}
            </span>
          </div>
        </StatTile>
      </div>

      <section className="glass rounded-[24px] p-4 sm:rounded-[28px] sm:p-6 xl:col-span-7">
        <PanelHeader title={t("home.timeline_title")} onOpen={onOpenQueue} openLabel={t("home.view_all")} />

        <div className="mt-5 grid grid-cols-7 gap-1 sm:gap-1.5">
          {weekDays.map((day, i) => (
            <div
              key={i}
              className={cn(
                "flex min-w-0 flex-col items-center gap-2 rounded-xl py-2.5 sm:rounded-2xl",
                i === 0 ? "bg-ink text-paper shadow-lift" : "bg-white/55"
              )}
            >
              <span className={cn("max-w-full truncate text-[0.68rem] font-semibold", i === 0 ? "text-paper/70" : "text-muted")}>
                {i === 0 ? (
                  <>
                    <span className="sm:hidden">{weekdayFmt.format(day.date)}</span>
                    <span className="hidden sm:inline">{t("home.today")}</span>
                  </>
                ) : (
                  weekdayFmt.format(day.date)
                )}
              </span>
              <span className="text-base leading-none font-bold tabular-nums">{day.date.getDate()}</span>
              <span className="flex h-2 items-center gap-0.5">
                {day.items.slice(0, 4).map(({ order, status }) => (
                  <span
                    key={order.id}
                    className={cn("size-1.5 rounded-full", STATUS_DOT[status], i === 0 && "ring-1 ring-paper/60")}
                  />
                ))}
                {day.items.length > 4 && <span className="text-[0.6rem] leading-none font-bold">+</span>}
              </span>
            </div>
          ))}
        </div>

        <ul className="mt-4 grid grid-cols-1 gap-1">
          {dueThisWeek.slice(0, TIMELINE_LIST_LIMIT).map(({ order, status }) => {
            const days = daysUntil(order.estimated_delivery!, now);
            return (
              <li key={order.id}>
                <button
                  type="button"
                  onClick={() => onOpenOrder(order.id)}
                  className="flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-start transition-colors hover:bg-white/60"
                >
                  <span className={cn("size-2.5 shrink-0 rounded-full", STATUS_DOT[status])} />
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block truncate text-sm font-semibold">
                      {order.order_number} · {order.customer_name}
                    </span>
                    <span className="block truncate text-xs text-muted">
                      {order.product_label} · {tPhase(order.phase)}
                    </span>
                  </span>
                  <span className={cn("shrink-0 text-xs font-semibold", days === 0 ? "text-accent-2" : "text-muted")}>
                    {new Intl.DateTimeFormat(dateLocale, { day: "numeric", month: "short" }).format(
                      parseDay(order.estimated_delivery!)
                    )}
                  </span>
                </button>
              </li>
            );
          })}
          {dueThisWeek.length === 0 && <p className="px-2 py-3 text-sm text-muted">{t("home.timeline_empty")}</p>}
        </ul>
      </section>

      <section className="glass rounded-[24px] p-4 sm:rounded-[28px] sm:p-6 xl:col-span-5">
        <PanelHeader title={t("home.activity_title")} />
        <ul className="mt-4 grid grid-cols-1 gap-0.5 max-sm:[&>li:nth-child(n+7)]:hidden">
          {activity.map((event) => {
            const { icon: Icon, tone } = EVENT_ICON[event.type] ?? EVENT_ICON.note;
            const label =
              event.type === "phase_change" && event.phase
                ? `${t(`detail.event.${event.type}`)} ${tPhase(event.phase)}`
                : t(`detail.event.${event.type}`);
            return (
              <li key={event.id}>
                <button
                  type="button"
                  onClick={() => onOpenOrder(event.order_id)}
                  className="group flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-start transition-colors hover:bg-white/60"
                >
                  <span className={cn("grid size-9 shrink-0 place-items-center rounded-full", tone)}>
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block truncate text-sm font-semibold">{label}</span>
                    <span className="block truncate text-xs text-muted">
                      {event.orders ? `${event.orders.order_number} · ${event.orders.customer_name} · ` : ""}
                      {formatRelativeDay(new Date(event.created_at), locale, dayLabels)}
                    </span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-faint transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
                </button>
              </li>
            );
          })}
          {activity.length === 0 && <p className="px-2 py-3 text-sm text-muted">{t("home.activity_empty")}</p>}
        </ul>
      </section>
    </div>
  );
}

function PanelHeader({
  title,
  sub,
  onOpen,
  openLabel,
}: {
  title: string;
  sub?: string;
  onOpen?: () => void;
  openLabel?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-base font-bold">{title}</h2>
        {sub && <p className="mt-0.5 text-xs leading-snug text-muted">{sub}</p>}
      </div>
      {onOpen && (
        <button
          type="button"
          onClick={onOpen}
          aria-label={openLabel}
          title={openLabel}
          className="grid size-8 shrink-0 place-items-center rounded-full bg-white/70 text-ink-2 shadow-soft transition-colors hover:bg-white"
        >
          <ArrowUpRight className="size-4 rtl:-scale-x-100" />
        </button>
      )}
    </div>
  );
}

function StatTile({
  label,
  value,
  tint,
  onClick,
  children,
}: {
  label: string;
  value: ReactNode;
  tint: Tint;
  onClick?: () => void;
  children: ReactNode;
}) {
  const body = (
    <>
      <span className="flex items-start justify-between gap-2">
        <span className="text-[0.8rem] leading-tight font-semibold text-ink-2">{label}</span>
        {onClick && <ArrowUpRight className="size-4 shrink-0 text-ink-2/50 transition-colors group-hover:text-ink rtl:-scale-x-100" />}
      </span>
      <span className="mt-2 mb-3 block text-[2rem] leading-none font-bold tracking-tight tabular-nums sm:mb-4 sm:text-[2.7rem]">
        {value}
      </span>
      <span className="mt-auto block">{children}</span>
    </>
  );
  const className = "glass group flex min-h-36 min-w-0 flex-col rounded-[22px] p-3.5 text-start sm:min-h-44 sm:rounded-[24px] sm:p-5";
  const style = { "--glass-tint": TINTS[tint] } as CSSProperties;

  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      style={style}
      className={cn(className, "transition-transform duration-200 hover:-translate-y-0.5")}
    >
      {body}
    </button>
  ) : (
    <div style={style} className={className}>
      {body}
    </div>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <span className="relative inline-block text-sm leading-none tracking-[0.08em]" aria-hidden>
      <span className="text-ink/15">★★★★★</span>
      <span className="absolute inset-0 overflow-hidden text-amber" style={{ width: `${(value / 5) * 100}%` }}>
        ★★★★★
      </span>
    </span>
  );
}
