import type { Order, OrderEvent } from "./types";

/** Event types whose `message` is written by staff for staff. */
const STAFF_ONLY_EVENT_MESSAGES: OrderEvent["type"][] = ["note", "cancelled", "reopened"];

/**
 * The tracking page hands the order to a client component (and its API
 * returns it as JSON), so anything internal must be removed before it leaves
 * the server: staff notes and the cancellation reason.
 */
export function toCustomerOrder(order: Order): Order {
  return { ...order, staff_notes: null, cancel_reason: null };
}

export function toCustomerEvents(events: OrderEvent[]): OrderEvent[] {
  return events.map((e) => (STAFF_ONLY_EVENT_MESSAGES.includes(e.type) ? { ...e, message: null } : e));
}
