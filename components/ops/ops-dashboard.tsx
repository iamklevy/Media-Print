"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { NextIntlClientProvider, useTranslations } from "next-intl";
import {
  Columns3,
  Globe,
  House,
  ListTodo,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { SIDEBAR_COOKIE } from "@/lib/ops-sidebar";
import { OpsHome } from "@/components/ops/ops-home";
import { PipelineBoard, type PipelineFilter } from "@/components/ops/pipeline-board";
import { OpsQueue } from "@/components/ops/ops-queue";
import { OrderDetailSheet } from "@/components/ops/order-detail-sheet";
import { deriveStatus, NEEDS_ACTION, type OrderStatus } from "@/lib/orders/status";
import { staffLogout, setOpsLocale } from "@/lib/orders/actions";
import type { ActivityItem } from "@/lib/orders/ops-feed";
import type { OpsLocale } from "@/lib/ops-locale";
import type { Order } from "@/lib/orders/types";

const POLL_MS = 20_000;

type View = "home" | "pipeline" | "queue";

export interface OrderWithStatus {
  order: Order;
  status: OrderStatus;
}

interface DashboardProps {
  initialOrders: Order[];
  initialActivity: ActivityItem[];
  locale: OpsLocale;
  staffName: string;
  staffEmail: string;
  initialSidebarCollapsed: boolean;
}

export function OpsDashboard({ messages, ...props }: DashboardProps & { messages: Record<string, unknown> }) {
  return (
    <NextIntlClientProvider locale={props.locale} messages={messages}>
      <Dashboard {...props} />
    </NextIntlClientProvider>
  );
}

function Dashboard({
  initialOrders,
  initialActivity,
  locale,
  staffName,
  staffEmail,
  initialSidebarCollapsed,
}: DashboardProps) {
  const t = useTranslations("ops");
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [activity, setActivity] = useState(initialActivity);
  const [view, setView] = useState<View>("home");
  const [filter, setFilter] = useState<PipelineFilter>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [switching, setSwitching] = useState(false);
  const [collapsed, setCollapsed] = useState(initialSidebarCollapsed);

  function setSidebar(next: boolean) {
    setCollapsed(next);
    // A cookie (not localStorage) so the server renders the saved state on the next load — no flash.
    document.cookie = `${SIDEBAR_COOKIE}=${next ? "collapsed" : "expanded"}; path=/ops; max-age=31536000; samesite=lax`;
  }

  // Labels stay in the DOM (clipped by the item) and fade, so the width
  // animation reveals/hides them smoothly instead of popping.
  const fade = cn(
    "whitespace-nowrap transition-opacity duration-200",
    collapsed ? "pointer-events-none opacity-0" : "opacity-100 delay-100"
  );
  const railItem =
    "flex w-full items-center gap-3 overflow-hidden rounded-2xl px-3 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors";
  // Lazy initializer runs once on mount, so it's exempt from React's
  // no-impure-calls-during-render rule; refreshed alongside each poll tick.
  const [now, setNow] = useState(() => Date.now());

  async function refresh() {
    try {
      const res = await fetch("/api/ops/orders", { cache: "no-store" });
      if (!res.ok) return;
      const fresh = await res.json();
      setOrders(fresh.orders);
      setActivity(fresh.activity);
      setNow(Date.now());
    } catch {
      // transient network hiccup — next poll will retry
    }
  }

  useEffect(() => {
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, []);

  const withStatus = useMemo<OrderWithStatus[]>(
    () => orders.map((o) => ({ order: o, status: deriveStatus(o) })),
    [orders]
  );

  const q = query.trim().toLowerCase();
  const searched = q
    ? withStatus.filter(
        ({ order }) => order.order_number.toLowerCase().includes(q) || order.customer_name.toLowerCase().includes(q)
      )
    : withStatus;

  const needsActionCount = withStatus.filter(({ status }) => NEEDS_ACTION.includes(status)).length;
  const selected = orders.find((o) => o.id === selectedId) ?? null;
  const dir = locale === "ar" ? "rtl" : "ltr";

  function goTo(next: View) {
    setView(next);
    // Below lg the window itself scrolls, so a long Home would otherwise
    // open the next view halfway down.
    window.scrollTo({ top: 0 });
  }

  function openPipeline(next: PipelineFilter) {
    setFilter(next);
    goTo("pipeline");
  }

  function onSearch(value: string) {
    setQuery(value);
    // Home has no list to filter, so searching from it jumps to the board.
    if (value && view === "home") setView("pipeline");
  }

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

  const nav: { key: View; icon: LucideIcon; badge?: number }[] = [
    { key: "home", icon: House },
    { key: "pipeline", icon: Columns3 },
    { key: "queue", icon: ListTodo, badge: needsActionCount },
  ];

  const heading =
    view === "home"
      ? { title: t("home.greeting", { name: staffName.split(" ")[0] }), sub: t("home.subtitle") }
      : { title: t(`nav.${view}`), sub: t(`${view}.subtitle`) };

  const today = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(now);

  return (
    <div
      dir={dir}
      className={cn(
        "ops-backdrop min-h-screen text-ink lg:flex lg:h-screen lg:overflow-hidden",
        locale === "ar" ? "font-arabic" : "font-sans"
      )}
    >
      {/* Collapsible rail: animating the aside's width (not overlaying it) lets
          <main> — and the pipeline's flex-1 columns — reflow with it. */}
      <aside
        className={cn(
          // relative z-30: the glass panel's backdrop-filter traps the tooltips' z-index
          // inside it, so the whole aside must sit above <main>'s (also glass) columns.
          "relative z-30 hidden shrink-0 p-3 pe-0 lg:block",
          "transition-[width] duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
          collapsed ? "lg:w-[86px]" : "lg:w-[256px]"
        )}
      >
        <div className="glass-strong flex h-full flex-col rounded-[28px] p-4">
          <div className="flex items-center gap-2 px-[3px] pt-1 pb-5">
            {collapsed ? (
              <Tip label={t("sidebar_open")}>
                <button
                  type="button"
                  onClick={() => setSidebar(false)}
                  aria-label={t("sidebar_open")}
                  aria-expanded={false}
                  className="group/logo relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-white p-[3px] shadow-soft"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo.png" alt="" className="size-full object-contain transition-opacity group-hover/logo:opacity-0" />
                  <PanelLeftOpen className="absolute size-[18px] text-ink-2 opacity-0 transition-opacity group-hover/logo:opacity-100 rtl:-scale-x-100" />
                </button>
              </Tip>
            ) : (
              <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-white p-[3px] shadow-soft">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="" className="size-full object-contain" />
              </span>
            )}
            {/* Fixed width + wrapping (not truncate) so the full name shows on two lines,
                and the row's height doesn't reflow while the rail animates. */}
            <span
              className={cn(fade, "w-[120px] shrink-0 text-[0.95rem] leading-tight font-bold whitespace-normal")}
            >
              {t("title")}
            </span>
            {!collapsed && (
              <Tip label={t("sidebar_close")} className="ms-auto">
                <button
                  type="button"
                  onClick={() => setSidebar(true)}
                  aria-label={t("sidebar_close")}
                  aria-expanded
                  className="grid size-8 shrink-0 place-items-center rounded-xl text-ink-2/75 transition-colors hover:bg-white/60 hover:text-ink"
                >
                  <PanelLeftClose className="size-[18px] rtl:-scale-x-100" />
                </button>
              </Tip>
            )}
          </div>

          <nav className="grid grid-cols-1 gap-1">
            {nav.map(({ key, icon: Icon, badge }) => (
              <Tip key={key} label={t(`nav.${key}`)} show={collapsed}>
                <button
                  type="button"
                  onClick={() => goTo(key)}
                  aria-current={view === key ? "page" : undefined}
                  aria-label={collapsed ? t(`nav.${key}`) : undefined}
                  className={cn(
                    railItem,
                    view === key ? "bg-white/90 text-ink shadow-soft" : "text-ink-2/75 hover:bg-white/50 hover:text-ink"
                  )}
                >
                  <span className="relative shrink-0">
                    <Icon className={cn("size-[18px]", view === key && "text-accent")} />
                    {!!badge && collapsed && (
                      <span className="absolute -end-1.5 -top-1.5 min-w-4 rounded-full bg-accent px-1 text-center text-[0.6rem] leading-4 font-bold text-white tabular-nums">
                        {badge}
                      </span>
                    )}
                  </span>
                  <span className={fade}>{t(`nav.${key}`)}</span>
                  {!!badge && (
                    <span
                      className={cn(
                        fade,
                        "ms-auto rounded-full bg-accent px-2 py-0.5 text-[0.7rem] leading-none font-bold text-white tabular-nums"
                      )}
                    >
                      {badge}
                    </span>
                  )}
                </button>
              </Tip>
            ))}
          </nav>

          {/* grid-cols-1 = minmax(0, 1fr): without it the long email widens the track past the sidebar. */}
          <div className="mt-auto grid grid-cols-1 gap-1">
            <Tip label={locale === "ar" ? "English" : "العربية"} show={collapsed}>
              <button
                type="button"
                onClick={toggleLocale}
                disabled={switching}
                aria-label={collapsed ? (locale === "ar" ? "English" : "العربية") : undefined}
                className={cn(railItem, "text-ink-2/75 hover:bg-white/50 hover:text-ink disabled:opacity-50")}
              >
                <Globe className="size-[18px] shrink-0" />
                <span className={fade}>{locale === "ar" ? "English" : "العربية"}</span>
              </button>
            </Tip>
            <Tip label={t("logout")} show={collapsed}>
              <button
                type="button"
                onClick={logout}
                aria-label={collapsed ? t("logout") : undefined}
                className={cn(railItem, "text-ink-2/75 hover:bg-white/50 hover:text-ink")}
              >
                <LogOut className="size-[18px] shrink-0 rtl:-scale-x-100" />
                <span className={fade}>{t("logout")}</span>
              </button>
            </Tip>
            <Tip label={staffName} show={collapsed}>
              <div
                className={cn(
                  "mt-2 flex min-w-0 items-center gap-3 overflow-hidden rounded-2xl transition-[background-color,padding] duration-300",
                  collapsed ? "bg-transparent p-[3px]" : "bg-white/60 p-2.5"
                )}
              >
                <Avatar name={staffName} />
                <div className={cn(fade, "min-w-0 leading-tight")}>
                  <p className="truncate text-sm font-semibold">{staffName}</p>
                  {/* Emails are LTR even on the Arabic board, so they truncate at the end, not the start. */}
                  <p dir="ltr" className={cn("truncate text-xs text-muted", locale === "ar" && "text-right")}>
                    {staffEmail}
                  </p>
                </div>
              </div>
            </Tip>
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col pb-24 lg:pb-0">
        <header className="flex flex-wrap items-end gap-x-6 gap-y-4 px-4 pt-5 pb-4 sm:px-6 lg:shrink-0 lg:px-8 lg:pt-7">
          <div className="flex w-full items-center justify-between gap-3 lg:hidden">
            <div className="flex items-center gap-2">
              <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-lg bg-white p-[3px] shadow-soft">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="" className="size-full object-contain" />
              </span>
              <span className="text-sm font-bold">{t("title")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleLocale}
                disabled={switching}
                aria-label={locale === "ar" ? "English" : "العربية"}
                className="glass grid size-9 place-items-center rounded-full"
              >
                <Globe className="size-4" />
              </button>
              <button
                type="button"
                onClick={logout}
                aria-label={t("logout")}
                className="glass grid size-9 place-items-center rounded-full"
              >
                <LogOut className="size-4 rtl:-scale-x-100" />
              </button>
            </div>
          </div>

          <div className="min-w-0">
            <h1 className="text-[1.9rem] leading-[1.1] font-bold tracking-tight sm:text-[2.4rem]">{heading.title}</h1>
            <p className="mt-1.5 text-[0.95rem] leading-snug text-muted">{heading.sub}</p>
          </div>

          <div className="flex w-full items-center gap-3 sm:ms-auto sm:w-auto">
            <span className="hidden text-sm whitespace-nowrap text-muted xl:inline">{today}</span>
            <label className="glass flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full px-4 sm:w-72 sm:flex-none">
              <Search className="size-4 shrink-0 text-muted" />
              <input
                value={query}
                onChange={(e) => onSearch(e.target.value)}
                placeholder={t("search_placeholder")}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted/80"
              />
            </label>
          </div>
        </header>

        <div
          className={cn(
            "px-4 sm:px-6 lg:min-h-0 lg:flex-1 lg:px-8",
            view === "pipeline" ? "lg:flex lg:flex-col lg:pb-6" : "lg:overflow-y-auto lg:pb-8"
          )}
        >
          {view === "home" && (
            <OpsHome
              items={withStatus}
              activity={activity}
              now={now}
              onOpenOrder={setSelectedId}
              onOpenPipeline={openPipeline}
              onOpenQueue={() => goTo("queue")}
            />
          )}
          {view === "pipeline" && (
            <PipelineBoard
              items={searched}
              filter={filter}
              onFilterChange={setFilter}
              now={now}
              onOpenOrder={setSelectedId}
            />
          )}
          {view === "queue" && <OpsQueue items={searched} now={now} onOpenOrder={setSelectedId} />}
        </div>
      </main>

      <nav className="glass-strong fixed inset-x-4 bottom-4 z-40 flex justify-around rounded-full p-1.5 lg:hidden">
        {nav.map(({ key, icon: Icon, badge }) => (
          <button
            key={key}
            type="button"
            onClick={() => goTo(key)}
            aria-current={view === key ? "page" : undefined}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-0.5 rounded-full py-1.5 text-[0.7rem] font-semibold transition-colors",
              view === key ? "bg-white/90 text-ink shadow-soft" : "text-ink-2/70"
            )}
          >
            <Icon className={cn("size-5", view === key && "text-accent")} />
            {t(`nav.${key}`)}
            {!!badge && (
              <span className="absolute start-[calc(50%+6px)] top-0.5 rounded-full bg-accent px-1.5 text-[0.62rem] leading-4 font-bold text-white tabular-nums">
                {badge}
              </span>
            )}
          </button>
        ))}
      </nav>

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

/** Dark hover label to the inline-end of a rail item, like the collapsed-sidebar tooltips in Gemini. */
function Tip({
  label,
  show = true,
  className,
  children,
}: {
  label: string;
  show?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("group/tip relative", className)}>
      {children}
      {show && (
        <span
          role="tooltip"
          className="pointer-events-none absolute start-full top-1/2 z-50 ms-3 -translate-y-1/2 rounded-lg bg-ink px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-white opacity-0 shadow-soft transition-opacity group-focus-within/tip:opacity-100 group-hover/tip:opacity-100 group-hover/tip:delay-150"
        >
          {label}
        </span>
      )}
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-linear-to-br from-accent to-accent-2 text-xs font-bold text-white shadow-soft">
      {initials}
    </span>
  );
}
