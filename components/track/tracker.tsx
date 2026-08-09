"use client";

import { useEffect, useState } from "react";

import { InProgressState } from "@/components/track/in-progress-state";
import { ApprovalGateState } from "@/components/track/approval-gate-state";
import { DeliveredState } from "@/components/track/delivered-state";
import { isGatePhase } from "@/lib/orders/phases";
import type { Order, OrderEvent } from "@/lib/orders/types";

const POLL_MS = 20_000;

export function Tracker({
  slug,
  initialOrder,
  initialEvents,
}: {
  slug: string;
  initialOrder: Order;
  initialEvents: OrderEvent[];
}) {
  const [order, setOrder] = useState(initialOrder);
  const [events, setEvents] = useState(initialEvents);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/track/${slug}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (data.order) setOrder(data.order);
        if (data.events) setEvents(data.events);
      } catch {
        // transient network hiccup — next poll will retry
      }
    }, POLL_MS);
    return () => clearInterval(id);
  }, [slug]);

  if (order.phase === "delivered") return <DeliveredState order={order} />;
  if (isGatePhase(order.phase)) return <ApprovalGateState order={order} />;
  return <InProgressState order={order} events={events} />;
}
