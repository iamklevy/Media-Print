"use client";

import { useTranslations } from "next-intl";

import { deriveStatus } from "@/lib/orders/status";
import type { Order } from "@/lib/orders/types";
import { StatusBadge } from "@/components/orders/status-badge";

export function OrderCard({ order, now, onClick }: { order: Order; now: number; onClick: () => void }) {
  const t = useTranslations("ops");
  const status = deriveStatus(order);
  const overdueDays = order.estimated_delivery
    ? Math.floor((now - new Date(order.estimated_delivery).getTime()) / 86_400_000)
    : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="grid w-full gap-1.5 rounded-[14px] border border-line bg-paper p-3 text-start text-sm transition-colors hover:border-accent"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-ink">{order.order_number}</span>
        <span className="truncate text-xs text-muted">{order.customer_name}</span>
      </div>
      <p className="truncate text-ink/80">
        {order.product_label} · {order.quantity}
      </p>
      <StatusBadge
        status={status}
        className="mt-1"
      />
      {status === "overdue" && overdueDays !== null && overdueDays > 0 && (
        <span className="text-xs font-medium text-danger">{t("overdue_by", { days: overdueDays })}</span>
      )}
      {order.rating != null && <span className="text-xs font-medium text-amber">{"★".repeat(order.rating)}</span>}
    </button>
  );
}
