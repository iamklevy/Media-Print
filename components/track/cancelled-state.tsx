"use client";

import { useTranslations, useLocale } from "next-intl";

import { formatOrderQuantity } from "@/lib/orders/quantity";
import type { Order } from "@/lib/orders/types";

/** Customer view of an order staff cancelled; replaces the progress/approval UI entirely. */
export function CancelledState({ order }: { order: Order }) {
  const t = useTranslations("track.cancelled");
  const tQty = useTranslations("quantity_ranges");
  const locale = useLocale();

  const dateFmt = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto grid max-w-lg gap-4 rounded-[18px] border border-line bg-paper p-6 shadow-soft">
      <div className="grid gap-2 rounded-lg bg-paper-2 p-4 text-center">
        <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-ink-2 text-lg font-bold text-white">✕</span>
        <h1 className="text-lg font-bold text-ink">{t("title")}</h1>
        {order.cancelled_at && <p className="text-sm text-muted">{dateFmt.format(new Date(order.cancelled_at))}</p>}
        <p className="text-sm text-muted">{t("body")}</p>
      </div>

      <dl className="grid grid-cols-2 gap-y-2 text-sm">
        <dt className="text-muted">{t("order_number")}</dt>
        <dd className="text-end font-medium" dir="ltr">{order.order_number}</dd>
        <dt className="text-muted">{t("product")}</dt>
        <dd className="text-end font-medium">{order.product_label}</dd>
        <dt className="text-muted">{t("quantity")}</dt>
        <dd className="text-end font-medium">{formatOrderQuantity(order, tQty)}</dd>
      </dl>
    </div>
  );
}
