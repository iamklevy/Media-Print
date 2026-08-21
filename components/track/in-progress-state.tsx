"use client";

import { useTranslations, useLocale } from "next-intl";
import {
  ClipboardCheck,
  PenTool,
  FileCheck2,
  PackageSearch,
  Wrench,
  Printer,
  Scissors,
  ShieldCheck,
  Package,
  Truck,
  PackageCheck,
  Check,
  Phone,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ArtworkFileList } from "@/components/orders/artwork-file-list";
import { PHASES, phaseIndex, type Phase } from "@/lib/orders/phases";
import { SALES_PHONE } from "@/lib/contact";
import { formatRelativeDay } from "@/lib/utils";
import type { Order, OrderEvent } from "@/lib/orders/types";

/** Icon shown on the currently-active step of the timeline. */
const PHASE_ICON: Record<Phase, LucideIcon> = {
  order_confirmed: ClipboardCheck,
  artwork_pre_press: PenTool,
  artwork_approved: FileCheck2,
  sample_produced: PackageSearch,
  sample_approved: FileCheck2,
  plates_tooling: Wrench,
  printing: Printer,
  finishing_die_cut: Scissors,
  quality_check: ShieldCheck,
  packed: Package,
  out_for_delivery: Truck,
  delivered: PackageCheck,
};

export function InProgressState({ order, events }: { order: Order; events: OrderEvent[] }) {
  const t = useTranslations("track");
  const locale = useLocale();

  const enteredAt = new Map<string, string>();
  for (const e of events) {
    if ((e.type === "phase_change" || e.type === "created") && e.phase) {
      if (!enteredAt.has(e.phase)) enteredAt.set(e.phase, e.created_at);
    }
  }

  const dayLabels = { today: t("today"), yesterday: t("yesterday") };
  // Newest/final milestone first, oldest completed step last — same reverse
  // order as the reference tracking-timeline design.
  const reversed = [...PHASES].reverse();

  return (
    <div className="mx-auto grid max-w-lg gap-5 rounded-[18px] border border-line bg-paper p-6 shadow-soft">
      <div>
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">
          {order.product_label} · {order.quantity}
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink" dir="ltr">
          {order.order_number}
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

      <ol className="grid">
        {reversed.map((p, i) => {
          const done = phaseIndex(p.key) < phaseIndex(order.phase);
          const current = p.key === order.phase;
          const pending = !done && !current;
          const at = enteredAt.get(p.key);
          const Icon = PHASE_ICON[p.key];
          const isLast = i === reversed.length - 1;

          return (
            <li key={p.key} className="relative flex gap-3 pb-6 last:pb-0">
              {!isLast &&
                (pending ? (
                  <span
                    className={`absolute top-6 bottom-0 border-s border-dashed border-line ${
                      locale === "ar" ? "end-[11px]" : "start-[11px]"
                    }`}
                  />
                ) : (
                  <span
                    className={`absolute top-6 bottom-0 w-px bg-line ${
                      locale === "ar" ? "end-[11px]" : "start-[11px]"
                    }`}
                  />
                ))}
              <span className="relative z-10 flex size-6 shrink-0 items-center justify-center">
                {current && <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-75" />}
                <span
                  className={`relative flex size-6 items-center justify-center rounded-full ${
                    done
                      ? "bg-leaf text-white"
                      : current
                        ? "bg-accent text-white"
                        : "border-2 border-dashed border-line bg-paper"
                  }`}
                >
                  {done ? <Check className="size-3.5" strokeWidth={3} /> : current ? <Icon className="size-3.5" /> : null}
                </span>
              </span>

              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex items-baseline justify-between gap-2">
                  <p className={`text-sm font-semibold ${current ? "text-ink" : done ? "text-ink" : "text-faint"}`}>
                    {t(`phase.${p.key}`)}
                  </p>
                  {at && (
                    <span className="shrink-0 text-xs text-muted whitespace-nowrap" dir="ltr">
                      {formatRelativeDay(new Date(at), locale, dayLabels)}
                    </span>
                  )}
                </div>
                <p className={`text-xs ${pending ? "text-faint" : "text-muted"}`}>{t(`phase_desc.${p.key}`)}</p>
              </div>
            </li>
          );
        })}
      </ol>

      <ArtworkFileList label={t("in_progress.your_files")} files={order.customer_artwork_files} />

      <div className="flex flex-wrap gap-2 border-t border-line pt-4">
        <Button asChild className="w-fit rounded-full bg-ink text-paper hover:bg-ink-2">
          <a href={`tel:+2${SALES_PHONE}`} dir="ltr">
            <Phone className="size-4" />
            {t("in_progress.message_sales")}
          </a>
        </Button>
        {order.order_total != null && (
          <Button asChild variant="outline" className="w-fit rounded-full border-line">
            <a href={`/api/track/${order.tracking_slug}/invoice`} target="_blank" rel="noopener">
              {t("in_progress.download_invoice")}
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
