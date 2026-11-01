import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getStaffUser } from "@/lib/auth/staff";
import { getOpsLocale } from "@/lib/ops-locale";
import { loadOpsFeed } from "@/lib/orders/ops-feed";
import { OpsDashboard } from "@/components/ops/ops-dashboard";
import { SIDEBAR_COOKIE } from "@/lib/ops-sidebar";

export const dynamic = "force-dynamic";

export default async function OpsPage() {
  // proxy.ts already gates /ops, but every entry point re-checks per Next's
  // own guidance: a request that bypasses the proxy matcher shouldn't also
  // bypass auth.
  const staff = await getStaffUser();
  if (!staff) {
    redirect("/ops/login");
  }

  const { orders, activity } = await loadOpsFeed();

  const locale = await getOpsLocale();
  const messages = (await import(`@/messages/${locale}.json`)).default;
  // Read server-side so the rail renders in its saved state with no flash.
  const sidebarCollapsed = (await cookies()).get(SIDEBAR_COOKIE)?.value === "collapsed";

  return (
    <OpsDashboard
      initialOrders={orders}
      initialActivity={activity}
      locale={locale}
      messages={messages}
      staffName={staff.name}
      staffEmail={staff.email}
      initialSidebarCollapsed={sidebarCollapsed}
    />
  );
}
