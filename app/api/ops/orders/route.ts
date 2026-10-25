import { NextResponse } from "next/server";

import { hasStaffSession } from "@/lib/auth/staff";
import { loadOpsFeed } from "@/lib/orders/ops-feed";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await hasStaffSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json(await loadOpsFeed());
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
