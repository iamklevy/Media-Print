import { redirect } from "next/navigation";

import { hasStaffSession } from "@/lib/auth/staff";
import { supabaseServer } from "@/lib/supabase/server";
import { getOpsLocale } from "@/lib/ops-locale";
import { KanbanBoard } from "@/components/ops/kanban-board";
import type { Order } from "@/lib/orders/types";

export const dynamic = "force-dynamic";

export default async function OpsPage() {
  // proxy.ts already gates /ops, but every entry point re-checks per Next's
  // own guidance: a request that bypasses the proxy matcher shouldn't also
  // bypass auth.
  if (!(await hasStaffSession())) {
    redirect("/ops/login");
  }

  const db = supabaseServer();
  const { data } = await db.from("orders").select("*").order("created_at", { ascending: false });

  const locale = await getOpsLocale();
  const messages = (await import(`@/messages/${locale}.json`)).default;

  return <KanbanBoard initialOrders={(data ?? []) as Order[]} locale={locale} messages={messages} />;
}
