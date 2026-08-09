import { NextResponse } from "next/server";

import { hasCustomerSession } from "@/lib/auth/customer";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;

  if (!(await hasCustomerSession(slug))) {
    return NextResponse.json({ error: "Not verified" }, { status: 401 });
  }

  const db = supabaseServer();
  const { data: order, error } = await db.from("orders").select("*").eq("tracking_slug", slug).single();
  if (error || !order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: events } = await db
    .from("order_events")
    .select("*")
    .eq("order_id", order.id)
    .order("created_at", { ascending: true });

  return NextResponse.json({ order, events: events ?? [] });
}
