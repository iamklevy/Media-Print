"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { NextIntlClientProvider, useTranslations } from "next-intl";
import { Globe } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OrderCard } from "@/components/ops/order-card";
import { OrderDetailSheet } from "@/components/ops/order-detail-sheet";
import { KANBAN_COLUMNS } from "@/lib/orders/phases";
import { deriveStatus } from "@/lib/orders/status";
import { staffLogout, setOpsLocale } from "@/lib/orders/actions";
import type { OpsLocale } from "@/lib/ops-locale";
import type { Order } from "@/lib/orders/types";

const POLL_MS = 20_000;

type Filter = "all" | "needs_action" | "waiting" | "overdue";

const TAB_TRIGGER_CLASS =
  "text-paper/70 hover:bg-paper/10 hover:text-paper data-[state=active]:bg-linear-to-r data-[state=active]:from-accent data-[state=active]:to-accent-2 data-[state=active]:text-paper data-[state=active]:hover:from-accent data-[state=active]:hover:to-accent-2";

export function KanbanBoard({
  initialOrders,
  locale,
  messages,
  staffName,
  staffEmail,
}: {
  initialOrders: Order[];
  locale: OpsLocale;
  messages: Record<string, unknown>;
  staffName: string;
  staffEmail: string;
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Board initialOrders={initialOrders} locale={locale} staffName={staffName} staffEmail={staffEmail} />
    </NextIntlClientProvider>
  );
}

function Board({
  initialOrders,
  locale,
  staffName,
  staffEmail,
}: {
  initialOrders: Order[];
  locale: OpsLocale;
  staffName: string;
  staffEmail: string;
}) {
  const t = useTranslations("ops");
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [switching, setSwitching] = useState(false);
  // Lazy initializer runs once on mount, so it's exempt from React's
  // no-impure-calls-during-render rule; refreshed alongside each poll tick.
  const [now, setNow] = useState(() => Date.now());

  async function refresh() {
    try {
      const res = await fetch("/api/ops/orders", { cache: "no-store" });
      if (!res.ok) return;
      const { orders: fresh } = await res.json();
      setOrders(fresh);
      setNow(Date.now());
    } catch {
      // transient network hiccup — next poll will retry
    }
  }

  useEffect(() => {
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, []);

  const withStatus = useMemo(() => orders.map((o) => ({ order: o, status: deriveStatus(o) })), [orders]);

  const rated = orders.filter((o) => o.rating != null);
  const avgRating = rated.length ? rated.reduce((sum, o) => sum + (o.rating ?? 0), 0) / rated.length : null;

  const counts = {
    live: orders.filter((o) => o.phase !== "delivered").length,
    waiting: withStatus.filter((o) => o.status === "waiting_on_customer").length,
    overdue: withStatus.filter((o) => o.status === "overdue").length,
    dueThisWeek: orders.filter((o) => {
      if (!o.estimated_delivery || o.phase === "delivered") return false;
      const days = (new Date(o.estimated_delivery).getTime() - now) / 86_400_000;
      return days >= 0 && days <= 7;
    }).length,
  };

  const q = query.trim().toLowerCase();
  const visible = withStatus.filter(({ order, status }) => {
    if (filter === "needs_action" && !["not_started", "in_progress", "overdue"].includes(status)) return false;
    if (filter === "waiting" && status !== "waiting_on_customer") return false;
    if (filter === "overdue" && status !== "overdue") return false;
    if (q && !order.order_number.toLowerCase().includes(q) && !order.customer_name.toLowerCase().includes(q)) {
      return false;
    }
    return true;
  });

  const selected = orders.find((o) => o.id === selectedId) ?? null;
  const dir = locale === "ar" ? "rtl" : "ltr";

  async function logout() {
    await staffLogout();
    router.replace("/ops/login");
  }

  async function toggleLocale() {
    setSwitching(true);
    await setOpsLocale(locale === "ar" ? "en" : "ar");
    router.refresh();
    setSwitching(false);
  }

  return (
    <div
      dir={dir}
      className={`min-h-screen sm:flex sm:h-screen sm:flex-col sm:overflow-hidden ${
        locale === "ar" ? "font-arabic" : "font-sans"
      }`}
    >
      <header className="border-b border-line bg-ink text-paper sm:shrink-0">
        <div className="mx-auto grid max-w-[1600px] gap-3 px-4 py-3 sm:flex sm:flex-wrap sm:items-center sm:gap-4 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-lg bg-white p-[3px] shadow-soft">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="" className="size-full object-contain" />
              </span>
              <h1 className="text-base font-bold">{t("title")}</h1>
            </div>
            <div className="flex items-center gap-1 sm:hidden">
              <span title={staffEmail} className="max-w-24 truncate text-xs text-paper/70">
                {staffName}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLocale}
                disabled={switching}
                className="text-paper/80 hover:bg-paper/10 hover:text-paper"
              >
                <Globe className="size-4 opacity-70" />
              </Button>
              <Button variant="ghost" size="sm" onClick={logout} className="text-paper/80 hover:bg-paper/10 hover:text-paper">
                {t("logout")}
              </Button>
            </div>
          </div>

          <div className="-mx-4 touch-pan-x overflow-x-auto px-4 sm:mx-0 sm:touch-auto sm:overflow-visible sm:px-0">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
              <TabsList className="bg-paper/10">
                <TabsTrigger value="all" className={TAB_TRIGGER_CLASS}>
                  {t("tabs.all")}
                </TabsTrigger>
                <TabsTrigger value="needs_action" className={TAB_TRIGGER_CLASS}>
                  {t("tabs.needs_action")}
                </TabsTrigger>
                <TabsTrigger value="waiting" className={TAB_TRIGGER_CLASS}>
                  {t("tabs.waiting")}
                </TabsTrigger>
                <TabsTrigger value="overdue" className={TAB_TRIGGER_CLASS}>
                  {t("tabs.overdue")}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search_placeholder")}
            className="h-9 w-full border-paper/20 bg-paper/10 text-paper placeholder:text-paper/50 sm:ms-auto sm:h-8 sm:w-56"
          />
          <div className="hidden items-center gap-3 sm:flex">
            <span title={staffEmail} className="max-w-40 truncate text-sm text-paper/70">
              {staffName}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLocale}
              disabled={switching}
              className="text-paper/80 hover:bg-paper/10 hover:text-paper"
            >
              <Globe className="size-4 opacity-70" />
              {locale === "ar" ? "English" : "العربية"}
            </Button>
            <Button variant="ghost" size="sm" onClick={logout} className="text-paper/80 hover:bg-paper/10 hover:text-paper">
              {t("logout")}
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px] touch-pan-x gap-4 overflow-x-auto px-4 py-4 text-sm sm:shrink-0 sm:touch-auto sm:flex-wrap sm:gap-6 sm:px-5">
        <span className="shrink-0">
          <b className="text-base">{counts.live}</b> {t("stats.live")}
        </span>
        <span className="shrink-0 text-amber">
          <b className="text-base">{counts.waiting}</b> {t("stats.waiting")}
        </span>
        <span className="shrink-0 text-danger">
          <b className="text-base">{counts.overdue}</b> {t("stats.overdue")}
        </span>
        <span className="shrink-0 text-muted">
          <b className="text-base text-ink">{counts.dueThisWeek}</b> {t("stats.due_this_week")}
        </span>
        {avgRating != null && (
          <span className="shrink-0 text-muted">
            <b className="text-base text-ink">★ {avgRating.toFixed(1)}</b> {t("stats.avg_rating")} ({rated.length})
          </span>
        )}
      </div>

      <div className="mx-auto grid max-w-[1600px] grid-flow-col auto-cols-[85vw] snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-8 sm:min-h-0 sm:flex-1 sm:auto-cols-[minmax(260px,1fr)] sm:auto-rows-fr sm:snap-none sm:overflow-y-hidden sm:px-5 sm:pb-4">
        {KANBAN_COLUMNS.map((col) => {
          const colOrders = visible.filter(({ order }) => col.phases.includes(order.phase));
          return (
            <div
              key={col.title}
              className="grid snap-center content-start gap-3 rounded-[14px] bg-paper-2 p-3 sm:flex sm:min-h-0 sm:flex-col"
            >
              <div className="flex items-center justify-between text-xs font-semibold tracking-wide text-muted uppercase sm:shrink-0">
                <span>{t(`columns.${col.title}`)}</span>
                <span className="rounded-full bg-line px-2 py-0.5 text-ink">{colOrders.length}</span>
              </div>
              <div className="grid gap-2 sm:min-h-0 sm:flex-1 sm:overflow-y-auto sm:pe-1">
                {colOrders.map(({ order }) => (
                  <OrderCard key={order.id} order={order} now={now} onClick={() => setSelectedId(order.id)} />
                ))}
                {colOrders.length === 0 && <p className="text-xs text-faint">{t("empty_column")}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <OrderDetailSheet
          key={selected.id}
          order={selected}
          open={!!selected}
          onOpenChange={(open) => !open && setSelectedId(null)}
          onChanged={refresh}
        />
      )}
    </div>
  );
}
