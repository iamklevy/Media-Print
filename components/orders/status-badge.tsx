import { STATUS_LABEL, type OrderStatus } from "@/lib/orders/status";
import { cn } from "@/lib/utils";

const STYLES: Record<OrderStatus, string> = {
  done: "bg-leaf-soft text-leaf",
  in_progress: "bg-accent-soft text-accent-2",
  waiting_on_customer: "bg-amber-soft text-amber",
  overdue: "bg-danger-soft text-danger",
  not_started: "bg-paper-2 text-muted",
};

/** Shared status pill — same colors/labels on the ops board and the customer page. */
export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        STYLES[status],
        className
      )}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-current" />
      {STATUS_LABEL[status]}
    </span>
  );
}
