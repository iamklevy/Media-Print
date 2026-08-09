import { notFound } from "next/navigation";

import { hasCustomerSession } from "@/lib/auth/customer";
import { supabaseServer } from "@/lib/supabase/server";
import { PhoneGateForm } from "@/components/track/phone-gate-form";
import { Tracker } from "@/components/track/tracker";
import type { Order, OrderEvent } from "@/lib/orders/types";

export const dynamic = "force-dynamic";

export default async function TrackPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { slug } = await params;

  const db = supabaseServer();
  const { data: order } = await db.from("orders").select("*").eq("tracking_slug", slug).single();
  if (!order) notFound();

  const verified = await hasCustomerSession(slug);
  if (!verified) {
    return (
      <div className="px-4 py-16">
        <PhoneGateForm slug={slug} />
      </div>
    );
  }

  const { data: events } = await db
    .from("order_events")
    .select("*")
    .eq("order_id", order.id)
    .order("created_at", { ascending: true });

  return (
    <div className="px-4 py-10 sm:py-16">
      <Tracker slug={slug} initialOrder={order as Order} initialEvents={(events ?? []) as OrderEvent[]} />
    </div>
  );
}
