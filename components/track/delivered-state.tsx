"use client";

import { useTranslations, useLocale } from "next-intl";

import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/track/rating-stars";
import type { Order } from "@/lib/orders/types";

export function DeliveredState({ order }: { order: Order }) {
  const t = useTranslations("track.delivered");
  const locale = useLocale();

  const dateFmt = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="mx-auto grid max-w-lg gap-4 rounded-[18px] border border-line bg-paper p-6 shadow-soft">
      <div className="grid gap-2 rounded-lg bg-leaf-soft p-4 text-center">
        <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-leaf text-lg font-bold text-white">✓</span>
        <h1 className="text-lg font-bold text-leaf">{t("title")}</h1>
        {order.delivered_at && <p className="text-sm text-leaf/80">{dateFmt.format(new Date(order.delivered_at))}</p>}
      </div>

      <dl className="grid grid-cols-2 gap-y-2 text-sm">
        <dt className="text-muted">{t("order_number")}</dt>
        <dd className="text-end font-medium" dir="ltr">{order.order_number}</dd>
        <dt className="text-muted">{t("product")}</dt>
        <dd className="text-end font-medium">{order.product_label}</dd>
        <dt className="text-muted">{t("quantity")}</dt>
        <dd className="text-end font-medium">{order.quantity}</dd>
        {order.order_total != null && (
          <>
            <dt className="text-muted">{t("order_total")}</dt>
            <dd className="text-end font-medium">
              {order.currency} {order.order_total.toLocaleString()}
            </dd>
          </>
        )}
      </dl>
      
      {order.order_total != null && (
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="w-fit border-line">
            <a href={`/api/track/${order.tracking_slug}/invoice`} target="_blank" rel="noopener">
              {t("download_invoice")}
            </a>
          </Button>
        </div>
      )}

      <RatingStars order={order} />
    </div>

  );
}
