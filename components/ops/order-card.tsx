"use client";

import { useTranslations } from "next-intl";

import { deriveStatus } from "@/lib/orders/status";
import type { Order } from "@/lib/orders/types";
import { StatusBadge } from "@/components/orders/status-badge";
import { formatOrderQuantity } from "@/lib/orders/quantity";

export function OrderCard({ order, now, onClick }: { order: Order; now: number; onClick: () => void }) {
  const t = useTranslations("ops");
  const tQty = useTranslations("quantity_ranges");
  const status = deriveStatus(order);
  const overdueDays = order.estimated_delivery
    ? Math.floor((now - new Date(order.estimated_delivery).getTime()) / 86_400_000)
    : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="grid w-full min-w-0 grid-cols-1 gap-1.5 rounded-[18px] border border-white/80 bg-white/85 p-3 text-start text-sm leading-snug shadow-soft transition-[transform,box-shadow,border-color] hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lift"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="shrink-0 font-semibold text-ink">{order.order_number}</span>
        <span className="min-w-0 truncate text-xs text-muted">{order.customer_name}</span>
      </div>
      <p className="truncate text-ink/80">
        {order.product_label} · {formatOrderQuantity(order, tQty)}
      </p>
      <StatusBadge
        status={status}
        className="mt-1 max-w-full"
      />
      {status === "overdue" && overdueDays !== null && overdueDays > 0 && (
        <span className="text-xs font-medium text-danger">{t("overdue_by", { days: overdueDays })}</span>
      )}
      {order.rating != null && <span className="text-xs font-medium text-amber">{"★".repeat(order.rating)}</span>}
    </button>
  );
}
