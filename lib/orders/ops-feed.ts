import "server-only";

import { supabaseServer } from "@/lib/supabase/server";
import type { Order, OrderEvent } from "./types";

/** An order_events row with just enough of its order to label it in the dashboard's activity feed. */
export interface ActivityItem extends OrderEvent {
  orders: Pick<Order, "order_number" | "customer_name"> | null;
}

const ACTIVITY_LIMIT = 15;

/** Everything the ops dashboard renders: every order plus the latest events across all of them. */
export async function loadOpsFeed(): Promise<{ orders: Order[]; activity: ActivityItem[] }> {
  const db = supabaseServer();
  const [ordersRes, activityRes] = await Promise.all([
    db.from("orders").select("*").order("created_at", { ascending: false }),
    db
      .from("order_events")
      .select("*, orders(order_number, customer_name)")
      .order("created_at", { ascending: false })
      .limit(ACTIVITY_LIMIT),
  ]);
  if (ordersRes.error) throw ordersRes.error;

  return {
    orders: (ordersRes.data ?? []) as Order[],
    // The feed is a nice-to-have — a failed events query shouldn't take the board down with it.
    activity: (activityRes.data ?? []) as ActivityItem[],
  };
}
