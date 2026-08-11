import { NextResponse } from "next/server";

import { hasStaffSession } from "@/lib/auth/staff";
import { supabaseServer } from "@/lib/supabase/server";
import { buildInvoicePdf } from "@/lib/invoice/pdf";
import type { Order } from "@/lib/orders/types";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await hasStaffSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const db = supabaseServer();
  const { data: order, error } = await db.from("orders").select("*").eq("id", id).single();
  if (error || !order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const pdf = await buildInvoicePdf(order as Order);
  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${order.order_number}-invoice.pdf"`,
    },
  });
}
