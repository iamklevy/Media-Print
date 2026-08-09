"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OrderCard } from "@/components/ops/order-card";
import { OrderDetailSheet } from "@/components/ops/order-detail-sheet";
import { KANBAN_COLUMNS } from "@/lib/orders/phases";
import { deriveStatus } from "@/lib/orders/status";
import { staffLogout } from "@/lib/orders/actions";
import type { Order } from "@/lib/orders/types";

const POLL_MS = 20_000;

type Filter = "all" | "needs_action" | "waiting" | "overdue";

export function KanbanBoard({ initialOrders }: { initialOrders: Order[] }) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
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

  async function logout() {
    await staffLogout();
    router.replace("/ops/login");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-ink text-paper">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-4 px-5 py-3">
          <h1 className="text-base font-bold">Operations</h1>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <TabsList className="bg-paper/10">
              <TabsTrigger value="all" className="text-paper/70 data-active:bg-paper data-active:text-ink">
                All jobs
              </TabsTrigger>
              <TabsTrigger value="needs_action" className="text-paper/70 data-active:bg-paper data-active:text-ink">
                Needs our action
              </TabsTrigger>
              <TabsTrigger value="waiting" className="text-paper/70 data-active:bg-paper data-active:text-ink">
                Waiting on customer
              </TabsTrigger>
              <TabsTrigger value="overdue" className="text-paper/70 data-active:bg-paper data-active:text-ink">
                Overdue
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search order or customer"
            className="ms-auto h-8 w-56 border-paper/20 bg-paper/10 text-paper placeholder:text-paper/50"
          />
          <Button variant="ghost" size="sm" onClick={logout} className="text-paper/80 hover:bg-paper/10 hover:text-paper">
            Log out
          </Button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px] flex-wrap gap-6 px-5 py-4 text-sm">
        <span>
          <b className="text-base">{counts.live}</b> live jobs
        </span>
        <span className="text-amber">
          <b className="text-base">{counts.waiting}</b> waiting on customer
        </span>
        <span className="text-danger">
          <b className="text-base">{counts.overdue}</b> overdue
        </span>
        <span className="text-muted">
          <b className="text-base text-ink">{counts.dueThisWeek}</b> due this week
        </span>
      </div>

      <div className="mx-auto grid max-w-[1600px] grid-flow-col auto-cols-[minmax(260px,1fr)] gap-4 overflow-x-auto px-5 pb-8">
        {KANBAN_COLUMNS.map((col) => {
          const colOrders = visible.filter(({ order }) => col.phases.includes(order.phase));
          return (
            <div key={col.title} className="grid content-start gap-3 rounded-[14px] bg-paper-2 p-3">
              <div className="flex items-center justify-between text-xs font-semibold tracking-wide text-muted uppercase">
                <span>{col.title}</span>
                <span className="rounded-full bg-line px-2 py-0.5 text-ink">{colOrders.length}</span>
              </div>
              <div className="grid gap-2">
                {colOrders.map(({ order }) => (
                  <OrderCard key={order.id} order={order} now={now} onClick={() => setSelectedId(order.id)} />
                ))}
                {colOrders.length === 0 && <p className="text-xs text-faint">Nothing here.</p>}
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
