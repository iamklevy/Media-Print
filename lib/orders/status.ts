import { GATE_PHASES } from "./phases";
import type { Order } from "./types";

export type OrderStatus = "done" | "in_progress" | "waiting_on_customer" | "overdue" | "not_started";

/**
 * Single derivation used by both the ops board and the customer page so the
 * two surfaces can never disagree on an order's badge.
 */
export function deriveStatus(order: Pick<Order, "phase" | "estimated_delivery">): OrderStatus {
  if (order.phase === "delivered") return "done";
  if (GATE_PHASES.includes(order.phase)) return "waiting_on_customer";
  if (order.phase === "order_confirmed") return "not_started";
  if (order.estimated_delivery && new Date(order.estimated_delivery) < startOfToday()) {
    return "overdue";
  }
  return "in_progress";
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
