"use client";

import { useCallback, useEffect, useState } from "react";

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

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/track/${slug}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (data.order) setOrder(data.order);
      if (data.events) setEvents(data.events);
    } catch {
      // transient network hiccup — next poll will retry
    }
  }, [slug]);

  // Lets an action (approve/request changes) apply the order+events it
  // already got back from the server, instead of firing a second round-trip
  // just to re-fetch what we were handed for free — this is what makes the
  // approval buttons feel instant instead of double-latency.
  const applyUpdate = useCallback((nextOrder: Order, newEvents?: OrderEvent[]) => {
    setOrder(nextOrder);
    if (newEvents?.length) setEvents((prev) => [...prev, ...newEvents]);
  }, []);

  useEffect(() => {
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  if (order.phase === "delivered") return <DeliveredState order={order} />;
  if (isGatePhase(order.phase)) return <ApprovalGateState order={order} onChanged={applyUpdate} />;
  return <InProgressState order={order} events={events} />;
}
