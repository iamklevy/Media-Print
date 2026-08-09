"use client";

import { useTranslations, useLocale } from "next-intl";

import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/site/brand-icons";
import { PHASES, phaseIndex } from "@/lib/orders/phases";
import { waLink } from "@/lib/contact";
import type { Order, OrderEvent } from "@/lib/orders/types";

export function InProgressState({ order, events }: { order: Order; events: OrderEvent[] }) {
  const t = useTranslations("track");
  const locale = useLocale();

  const enteredAt = new Map<string, string>();
  for (const e of events) {
    if ((e.type === "phase_change" || e.type === "created") && e.phase) {
      if (!enteredAt.has(e.phase)) enteredAt.set(e.phase, e.created_at);
    }
  }

  const dateFmt = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="mx-auto grid max-w-lg gap-4 rounded-[18px] border border-line bg-paper p-6 shadow-soft">
      <div>
        <p className="text-sm text-muted">{order.order_number}</p>
        <h1 className="text-lg font-bold">
          {order.product_label} · {order.quantity}
        </h1>
        {order.estimated_delivery && (
          <p className="mt-1 text-sm font-semibold text-accent-2">
            {t("in_progress.estimated_delivery")}{" "}
            {new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", { day: "numeric", month: "long" }).format(
              new Date(order.estimated_delivery)
            )}
          </p>
        )}
      </div>

      <ol className="grid gap-2.5 border-t border-line pt-4">
        {PHASES.map((p) => {
          const done = phaseIndex(p.key) < phaseIndex(order.phase);
          const current = p.key === order.phase;
          const at = enteredAt.get(p.key);
          return (
            <li key={p.key} className="flex items-start gap-2.5 text-sm">
              <span
                className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  done ? "bg-leaf text-white" : current ? "bg-accent text-white" : "bg-line text-muted"
                }`}
              >
                {done ? "✓" : ""}
              </span>
              <span className={current ? "font-semibold text-ink" : done ? "text-ink/80" : "text-faint"}>
                {t(`phase.${p.key}`)}
                {current && at && <span className="ms-2 text-xs font-normal text-muted">{dateFmt.format(new Date(at))}</span>}
              </span>
            </li>
          );
        })}
      </ol>

      <Button asChild className="w-fit rounded-full bg-ink text-paper hover:bg-ink-2">
        <a href={waLink(`${t("in_progress.message_prefix")} ${order.order_number}`)} target="_blank" rel="noopener">
          <WhatsAppIcon className="size-4" />
          {t("in_progress.message_sales")}
        </a>
      </Button>
    </div>
  );
}
