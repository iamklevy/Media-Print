"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Check, Copy } from "lucide-react";

import { WhatsAppIcon } from "@/components/site/brand-icons";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/orders/status-badge";
import { SamplePhotoUploader } from "@/components/ops/sample-photo-uploader";
import { ArtworkFileUploader } from "@/components/ops/artwork-file-uploader";
import { CustomInvoiceUploader } from "@/components/ops/custom-invoice-uploader";
import { ArtworkFileList } from "@/components/orders/artwork-file-list";
import { deriveStatus } from "@/lib/orders/status";
import { PHASES, isGatePhase, nextPhase, phaseIndex } from "@/lib/orders/phases";
import { waLinkTo } from "@/lib/contact";
import { formatRelativeDay } from "@/lib/utils";
import { trackingUrl } from "@/lib/orders/tracking";
import { advancePhase, sendReminder, updateOrderFields, getOrderEvents } from "@/lib/orders/actions";
import type { Order, OrderEvent, SampleImage, ArtworkFile } from "@/lib/orders/types";

/** Quantity is free text (e.g. "5,000 bags") — pull the leading number out of it. */
function parseQuantityNumber(quantity: string): number | null {
  const match = quantity.replace(/,/g, "").match(/\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : null;
}

export function OrderDetailSheet({
  order,
  open,
  onOpenChange,
  onChanged,
}: {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}) {
  const t = useTranslations("ops.detail");
  const tPhase = useTranslations("track.phase");
  const locale = useLocale();
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [fields, setFields] = useState({
    product_label: order.product_label,
    quantity: order.quantity,
    unit_price: order.unit_price?.toString() ?? "",
    lead_time_days: order.lead_time_days?.toString() ?? "",
    estimated_delivery: order.estimated_delivery ?? "",
  });
  const [sampleImages, setSampleImages] = useState<SampleImage[]>(order.sample_images);
  const [artworkFiles, setArtworkFiles] = useState<ArtworkFile[]>(order.artwork_files);
  const [invoiceFile, setInvoiceFile] = useState<ArtworkFile | null>(order.invoice_file);
  const [saving, setSaving] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [advanceError, setAdvanceError] = useState<string | null>(null);
  const [reminding, setReminding] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const status = deriveStatus(order);
  const gate = isGatePhase(order.phase);
  const next = nextPhase(order.phase);
  const quoteMissing = order.phase === "quote_pending" && (order.unit_price == null || !order.invoice_file);
  const showSampleImages = order.phase === "sample_produced" || order.phase === "sample_approved";
  const showArtworkFiles = order.phase === "artwork_pre_press" || order.phase === "artwork_approved";
  const trackUrl = trackingUrl(order.tracking_slug, locale);

  const leadTimeDue = useMemo(() => {
    if (!order.lead_time_started_at || !fields.lead_time_days) return null;
    const days = Number(fields.lead_time_days);
    if (!Number.isFinite(days)) return null;
    const due = new Date(order.lead_time_started_at);
    due.setDate(due.getDate() + days);
    return due;
  }, [order.lead_time_started_at, fields.lead_time_days]);

  const orderTotal = useMemo(() => {
    const price = parseFloat(fields.unit_price);
    const qty = parseQuantityNumber(fields.quantity);
    if (Number.isNaN(price) || qty === null) return null;
    return price * qty;
  }, [fields.unit_price, fields.quantity]);

  useEffect(() => {
    getOrderEvents(order.id).then(setEvents);
    // Re-fetch whenever the order changes too (not just on first open) — the
    // ops board polls every 20s, so if the customer requests changes while
    // this sheet is already open, the new note should show up without the
    // staff having to close and reopen it.
  }, [order.id, order.updated_at]);

  const dayLabels = { today: t("today"), yesterday: t("yesterday") };
  const EVENT_LABEL: Record<OrderEvent["type"], string> = {
    created: t("event.created"),
    phase_change: t("event.phase_change"),
    customer_approved: t("event.customer_approved"),
    customer_requested_changes: t("event.customer_requested_changes"),
    reminder_sent: t("event.reminder_sent"),
    rated: t("event.rated"),
    note: t("event.note"),
  };

  async function save() {
    setSaving(true);
    await updateOrderFields(order.id, {
      product_label: fields.product_label,
      quantity: fields.quantity,
      unit_price: fields.unit_price ? Number(fields.unit_price) : null,
      order_total: orderTotal,
      lead_time_days: fields.lead_time_days ? Number(fields.lead_time_days) : null,
      estimated_delivery: fields.estimated_delivery || null,
    });
    setSaving(false);
    onChanged();
  }

  async function advance() {
    setAdvancing(true);
    const res = await advancePhase(order.id);
    setAdvancing(false);
    if (!res.ok) {
      setAdvanceError(res.error ?? t("advance_failed"));
      return;
    }
    setAdvanceError(null);
    onChanged();
    onOpenChange(false);
  }

  async function copyTrackingLink() {
    if (window.isSecureContext && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(trackUrl);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
        return;
      } catch {
        // permission denied — fall through to the silent fallback below
      }
    }

    // On plain HTTP (e.g. a LAN IP the ops tablets hit), navigator.clipboard
    // is undefined. Copy via a temporary off-screen textarea instead of
    // popping a native prompt() dialog — no visible UI, just the clipboard.
    const el = document.createElement("textarea");
    el.value = trackUrl;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.focus();
    el.select();
    try {
      document.execCommand("copy");
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } finally {
      document.body.removeChild(el);
    }
  }

  async function remind() {
    setReminding(true);
    const res = await sendReminder(order.id);
    setReminding(false);
    if (res.ok && res.message) {
      window.open(waLinkTo(order.customer_phone, res.message), "_blank", "noopener");
      onChanged();
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="center" className="gap-0 overflow-y-auto bg-paper text-ink">
        <SheetHeader className="border-b border-line">
          <SheetTitle className="text-ink">{order.order_number}</SheetTitle>
          <p className="text-xs text-muted">
            {t("created_at", { date: formatRelativeDay(new Date(order.created_at), locale, dayLabels) })}
          </p>
          <SheetDescription>
            {order.customer_name}
            {order.customer_company ? ` · ${order.customer_company}` : ""} · <span dir="ltr">{order.customer_phone}</span>
          </SheetDescription>
          <div className="mt-1 flex items-center gap-2">
            <StatusBadge status={status} />
            <Button onClick={copyTrackingLink} variant="outline" size="sm" className="h-6 gap-1 border-line px-2 text-xs">
              {linkCopied ? <Check className="size-3" /> : <Copy className="size-3" />}
              {linkCopied ? t("link_copied") : t("copy_tracking_link")}
            </Button>
            <Button
              asChild
              size="sm"
              className="h-6 gap-1 border-transparent bg-[#1DA851] px-2 text-xs text-white hover:bg-[#25D366]"
            >
              <a href={waLinkTo(order.customer_phone, "")} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="size-3" />
                {t("message_whatsapp")}
              </a>
            </Button>
          </div>
        </SheetHeader>

        <div className="grid gap-5 p-4">
          <section className="grid gap-3">
            <h3 className="text-xs font-semibold tracking-wide text-muted uppercase">{t("order_details")}</h3>
            <div className="grid gap-1.5">
              <Label htmlFor="product_label">{t("product")}</Label>
              <Input
                id="product_label"
                value={fields.product_label}
                onChange={(e) => setFields((f) => ({ ...f, product_label: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="quantity">{t("quantity")}</Label>
                <Input
                  id="quantity"
                  value={fields.quantity}
                  onChange={(e) => setFields((f) => ({ ...f, quantity: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="lead_time_days">{t("lead_time")}</Label>
                <Input
                  id="lead_time_days"
                  type="number"
                  min={0}
                  value={fields.lead_time_days}
                  onChange={(e) => setFields((f) => ({ ...f, lead_time_days: e.target.value }))}
                />
                <p className="text-xs text-faint">
                  {leadTimeDue
                    ? t("lead_time_note_started", {
                        started: new Date(order.lead_time_started_at!).toLocaleDateString(locale),
                        due: leadTimeDue.toLocaleDateString(locale),
                      })
                    : t("lead_time_note_pending")}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="unit_price">{t("unit_price")}</Label>
                <Input
                  id="unit_price"
                  type="number"
                  min={0}
                  step="0.01"
                  value={fields.unit_price}
                  onChange={(e) => setFields((f) => ({ ...f, unit_price: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="order_total">{t("order_total")}</Label>
                <Input
                  id="order_total"
                  type="number"
                  value={orderTotal != null ? orderTotal.toFixed(2) : ""}
                  disabled
                  readOnly
                  title={t("order_total_auto")}
                  className="disabled:opacity-70"
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="estimated_delivery">{t("estimated_delivery")}</Label>
              <Input
                id="estimated_delivery"
                type="date"
                value={fields.estimated_delivery}
                onChange={(e) => setFields((f) => ({ ...f, estimated_delivery: e.target.value }))}
              />
            </div>

            {order.notes && (
              <div className="grid gap-1.5">
                <Label>{t("request_details")}</Label>
                <p className="rounded-md bg-paper-2 p-2 text-sm text-ink/80">{order.notes}</p>
              </div>
            )}

            <ArtworkFileList
              label={t("customer_artwork")}
              hint={t("customer_artwork_hint")}
              files={order.customer_artwork_files}
            />

            {showArtworkFiles && (
              <ArtworkFileUploader
                orderId={order.id}
                files={artworkFiles}
                onChanged={(next) => {
                  setArtworkFiles(next);
                  onChanged();
                }}
              />
            )}

            {showSampleImages && (
              <SamplePhotoUploader
                orderId={order.id}
                images={sampleImages}
                onChanged={(next) => {
                  setSampleImages(next);
                  onChanged();
                }}
              />
            )}

            <CustomInvoiceUploader
              orderId={order.id}
              file={invoiceFile}
              onChanged={(next) => {
                setInvoiceFile(next);
                onChanged();
              }}
            />

            <div className="flex flex-wrap gap-2">
              <Button onClick={save} disabled={saving} variant="outline" className="w-fit border-line">
                {saving ? t("saving") : t("save")}
              </Button>
            </div>
          </section>

          <section className="grid gap-2">
            <h3 className="text-xs font-semibold tracking-wide text-muted uppercase">{t("activity")}</h3>
            {events.length === 0 ? (
              <p className="text-sm text-faint">{t("no_activity")}</p>
            ) : (
              <ol className="grid gap-2">
                {events.map((e) => (
                  <li key={e.id} className="grid gap-1 text-sm">
                    <div className="flex items-baseline justify-between gap-2">
                      <span
                        className={
                          e.type === "customer_requested_changes" ? "font-semibold text-danger" : "font-medium text-ink"
                        }
                      >
                        {EVENT_LABEL[e.type]}
                        {e.type === "phase_change" && e.phase ? `: ${tPhase(e.phase)}` : ""}
                        {e.actor_name && (
                          <span className="font-normal text-muted"> · {t("event_by", { name: e.actor_name })}</span>
                        )}
                      </span>
                      <span className="shrink-0 text-xs text-muted whitespace-nowrap" dir="ltr">
                        {formatRelativeDay(new Date(e.created_at), locale, dayLabels)}
                      </span>
                    </div>
                    {e.message && (
                      <p
                        className={`rounded-md p-2 text-ink/80 ${
                          e.type === "customer_requested_changes" ? "bg-danger-soft" : "bg-paper-2"
                        }`}
                      >
                        {e.message}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="grid gap-2">
            <h3 className="text-xs font-semibold tracking-wide text-muted uppercase">{t("rating_title")}</h3>
            {order.rating != null ? (
              <div className="grid gap-1">
                <span className="text-amber">{"★".repeat(order.rating)}{"☆".repeat(5 - order.rating)}</span>
                {order.rating_comment && <p className="text-sm text-ink/80">{order.rating_comment}</p>}
              </div>
            ) : (
              <p className="text-sm text-faint">{t("rating_none")}</p>
            )}
          </section>

          <section className="grid gap-2">
            <h3 className="text-xs font-semibold tracking-wide text-muted uppercase">{t("pipeline")}</h3>
            <ol className="grid gap-1.5">
              {PHASES.map((p) => {
                const done = phaseIndex(p.key) < phaseIndex(order.phase);
                const current = p.key === order.phase;
                return (
                  <li
                    key={p.key}
                    className={`flex items-center gap-2 text-sm ${
                      current ? "font-semibold text-ink" : done ? "text-muted" : "text-faint"
                    }`}
                  >
                    <span
                      className={`size-2 shrink-0 rounded-full ${
                        done ? "bg-leaf" : current ? (p.gate ? "bg-amber" : "bg-accent") : "bg-line"
                      }`}
                    />
                    {tPhase(p.key)}
                    {current && p.gate && <span className="ms-2 text-xs font-normal text-amber">{t("your_turn")}</span>}
                  </li>
                );
              })}
            </ol>
          </section>
        </div>

        <SheetFooter className="border-t border-line">
          {order.phase === "delivered" ? (
            <p className="text-sm font-semibold text-leaf">{t("delivered")}</p>
          ) : gate ? (
            <>
              <p className="text-sm text-muted">
                {order.phase === "quote_review" ? t("waiting_note_quote") : t("waiting_note")}
              </p>
              <Button onClick={remind} disabled={reminding} className="bg-[#1DA851] text-white hover:bg-[#25D366]">
                {reminding ? t("reminding") : t("remind")}
              </Button>
            </>
          ) : (
            <>
              {quoteMissing && <p className="text-sm text-muted">{t("quote_missing_hint")}</p>}
              {advanceError && <p className="text-sm font-semibold text-danger">{advanceError}</p>}
              <Button onClick={advance} disabled={advancing || !next || quoteMissing} className="bg-accent hover:bg-accent-2">
                {advancing ? t("advancing") : t("advance", { phase: next ? tPhase(next) : "—" })}
              </Button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
