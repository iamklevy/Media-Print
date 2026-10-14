"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Ban, Check, Copy, RotateCcw, Trash2 } from "lucide-react";

import { WhatsAppIcon } from "@/components/site/brand-icons";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { OPS_BUTTON, OPS_BUTTON_SM, OPS_TONE_DANGER, OPS_TONE_NEUTRAL } from "@/components/ops/button-styles";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { StatusBadge } from "@/components/orders/status-badge";
import { SamplePhotoUploader } from "@/components/ops/sample-photo-uploader";
import { ArtworkFileUploader } from "@/components/ops/artwork-file-uploader";
import { CustomInvoiceUploader } from "@/components/ops/custom-invoice-uploader";
import { ArtworkFileList } from "@/components/orders/artwork-file-list";
import { deriveStatus } from "@/lib/orders/status";
import { PHASES, isGatePhase, nextPhase, phaseIndex } from "@/lib/orders/phases";
import { waLinkTo } from "@/lib/contact";
import { cn, formatRelativeDay } from "@/lib/utils";
import { trackingUrl } from "@/lib/orders/tracking";
import {
  advancePhase,
  sendReminder,
  updateOrderFields,
  getOrderEvents,
  deleteOrder,
  cancelOrder,
  reopenOrder,
} from "@/lib/orders/actions";
import { isQuantityRange, quantityRangeLowerBound } from "@/lib/orders/quantity";
import type { Order, OrderEvent, SampleImage, ArtworkFile } from "@/lib/orders/types";

/**
 * New orders store a fixed range code (e.g. "1000_5000") — use its lower bound
 * as a conservative estimate for the order-total math. Orders created before
 * this change may still carry free text (e.g. "5,000 bags"); pull the leading
 * number out of those instead.
 */
function parseQuantityNumber(quantity: string): number | null {
  if (isQuantityRange(quantity)) return quantityRangeLowerBound(quantity);
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
  const tQty = useTranslations("quantity_ranges");
  const locale = useLocale();
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [fields, setFields] = useState({
    product_label: order.product_label,
    confirmed_quantity: order.confirmed_quantity?.toString() ?? "",
    unit_price: order.unit_price?.toString() ?? "",
    lead_time_days: order.lead_time_days?.toString() ?? "",
    estimated_delivery: order.estimated_delivery ?? "",
    staff_notes: order.staff_notes ?? "",
  });
  const [sampleImages, setSampleImages] = useState<SampleImage[]>(order.sample_images);
  const [artworkFiles, setArtworkFiles] = useState<ArtworkFile[]>(order.artwork_files);
  const [invoiceFile, setInvoiceFile] = useState<ArtworkFile | null>(order.invoice_file);
  const [saving, setSaving] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [advanceError, setAdvanceError] = useState<string | null>(null);
  const [reminding, setReminding] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [reopening, setReopening] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const status = deriveStatus(order);
  const cancelled = !!order.cancelled_at;
  const gate = isGatePhase(order.phase);
  const next = nextPhase(order.phase);
  const quoteMissing =
    order.phase === "quote_pending" &&
    (order.unit_price == null || !order.invoice_file || order.confirmed_quantity == null);
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

  const confirmedQty = fields.confirmed_quantity ? Number(fields.confirmed_quantity) : null;
  const hasConfirmedQty = confirmedQty !== null && Number.isFinite(confirmedQty) && confirmedQty > 0;

  const orderTotal = useMemo(() => {
    const price = parseFloat(fields.unit_price);
    const qty = hasConfirmedQty ? confirmedQty : parseQuantityNumber(order.quantity);
    if (Number.isNaN(price) || qty === null) return null;
    return price * qty;
  }, [fields.unit_price, order.quantity, hasConfirmedQty, confirmedQty]);
  const orderTotalIsEstimate = !hasConfirmedQty;

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
    cancelled: t("event.cancelled"),
    reopened: t("event.reopened"),
  };

  async function save() {
    setSaving(true);
    await updateOrderFields(order.id, {
      product_label: fields.product_label,
      confirmed_quantity: hasConfirmedQty ? confirmedQty : null,
      unit_price: fields.unit_price ? Number(fields.unit_price) : null,
      order_total: orderTotal,
      lead_time_days: fields.lead_time_days ? Number(fields.lead_time_days) : null,
      estimated_delivery: fields.estimated_delivery || null,
      staff_notes: fields.staff_notes.trim() || null,
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

  async function cancel() {
    setCancelling(true);
    const res = await cancelOrder(order.id, cancelReason);
    setCancelling(false);
    if (!res.ok) {
      setCancelError(res.error ?? t("cancel_failed"));
      return;
    }
    setCancelError(null);
    setCancelReason("");
    onChanged();
  }

  async function reopen() {
    setReopening(true);
    const res = await reopenOrder(order.id);
    setReopening(false);
    if (!res.ok) {
      setCancelError(res.error ?? t("reopen_failed"));
      return;
    }
    setCancelError(null);
    onChanged();
  }

  async function remove() {
    setDeleting(true);
    const res = await deleteOrder(order.id);
    setDeleting(false);
    if (!res.ok) {
      setDeleteError(res.error ?? t("delete_failed"));
      return;
    }
    onChanged();
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="center" className="gap-0 overflow-x-hidden overflow-y-auto bg-paper text-ink">
        <SheetHeader className="border-b border-line">
          <SheetTitle className="text-ink">{order.order_number}</SheetTitle>
          <p className="text-xs text-muted">
            {t("created_at", { date: formatRelativeDay(new Date(order.created_at), locale, dayLabels) })}
          </p>
          <SheetDescription>
            {order.customer_name}
            {order.customer_company ? ` · ${order.customer_company}` : ""} · <span dir="ltr">{order.customer_phone}</span>
          </SheetDescription>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <StatusBadge status={status} />
            <Button onClick={copyTrackingLink} variant="outline" className={cn(OPS_BUTTON_SM, "border-line")}>
              {linkCopied ? <Check className="size-3" /> : <Copy className="size-3" />}
              {linkCopied ? t("link_copied") : t("copy_tracking_link")}
            </Button>
            {/* phones: status + link on line 1, the three actions on line 2 */}
            <span aria-hidden className="basis-full sm:hidden" />
            <Button
              asChild
              className={cn(OPS_BUTTON_SM, "border-transparent bg-[#1DA851] text-white hover:bg-[#25D366]")}
            >
              <a href={waLinkTo(order.customer_phone, "")} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="size-3" />
                <span className="sm:hidden">{t("message_whatsapp_short")}</span>
                <span className="hidden sm:inline">{t("message_whatsapp")}</span>
              </a>
            </Button>

            {!cancelled && order.phase !== "delivered" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" className={cn(OPS_BUTTON_SM, OPS_TONE_NEUTRAL)}>
                    <Ban className="size-3" />
                    <span className="sm:hidden">{t("cancel_order_short")}</span>
                    <span className="hidden sm:inline">{t("cancel_order")}</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("cancel_confirm_title")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("cancel_confirm_desc", { order_number: order.order_number })}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="grid gap-1.5">
                    <Label htmlFor="cancel_reason">{t("cancel_reason")}</Label>
                    <Textarea
                      id="cancel_reason"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder={t("cancel_reason_placeholder")}
                      maxLength={1000}
                      className="border-line"
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel className={cn(OPS_BUTTON, OPS_TONE_NEUTRAL)}>{t("cancel_keep")}</AlertDialogCancel>
                    <AlertDialogAction className={cn(OPS_BUTTON, OPS_TONE_DANGER)} onClick={cancel} disabled={cancelling}>
                      {cancelling ? t("cancelling") : t("cancel_confirm_action")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className={cn(OPS_BUTTON_SM, OPS_TONE_DANGER)}>
                  <Trash2 className="size-3" />
                  <span className="sm:hidden">{t("delete_short")}</span>
                  <span className="hidden sm:inline">{t("delete")}</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("delete_confirm_title")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("delete_confirm_desc", { order_number: order.order_number })}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className={cn(OPS_BUTTON, OPS_TONE_NEUTRAL)}>{t("delete_cancel")}</AlertDialogCancel>
                  <AlertDialogAction className={cn(OPS_BUTTON, OPS_TONE_DANGER)} onClick={remove} disabled={deleting}>
                    {deleting ? t("deleting") : t("delete_confirm_action")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          {deleteError && <p className="mt-1 text-xs font-semibold text-danger">{deleteError}</p>}
          {cancelError && <p className="mt-1 text-xs font-semibold text-danger">{cancelError}</p>}
          {cancelled && (
            <div className="mt-2 grid gap-1 rounded-md bg-paper-2 p-3 text-sm">
              <p className="font-semibold text-ink">
                {t("cancelled_on", { date: formatRelativeDay(new Date(order.cancelled_at!), locale, dayLabels) })}
              </p>
              {order.cancel_reason && <p className="text-ink/80">{order.cancel_reason}</p>}
            </div>
          )}
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
                  value={isQuantityRange(order.quantity) ? tQty(order.quantity) : order.quantity}
                  disabled
                  readOnly
                  title={t("quantity_readonly_hint")}
                  className="disabled:opacity-70"
                />
              </div>
              <div className="grid gap-1.5">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="lead_time_days">{t("lead_time")}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        aria-label={t("lead_time_note_toggle")}
                        className="flex h-4 w-4 items-center justify-center rounded-full border border-line text-[10px] font-semibold leading-none text-faint hover:bg-canvas hover:text-ink"
                      >
                        !
                      </button>
                    </PopoverTrigger>
                    <PopoverContent>
                      {leadTimeDue
                        ? t("lead_time_note_started", {
                            started: new Date(order.lead_time_started_at!).toLocaleDateString(locale),
                            due: leadTimeDue.toLocaleDateString(locale),
                          })
                        : t("lead_time_note_pending")}
                    </PopoverContent>
                  </Popover>
                </div>
                <Input
                  id="lead_time_days"
                  type="number"
                  min={0}
                  value={fields.lead_time_days}
                  onChange={(e) => setFields((f) => ({ ...f, lead_time_days: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="confirmed_quantity">{t("confirmed_quantity")}</Label>
              <Input
                id="confirmed_quantity"
                type="number"
                min={1}
                value={fields.confirmed_quantity}
                onChange={(e) => setFields((f) => ({ ...f, confirmed_quantity: e.target.value }))}
                placeholder={t("confirmed_quantity_placeholder")}
              />
              <p className="text-xs text-faint">{t("confirmed_quantity_hint")}</p>
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
                  type="text"
                  value={
                    orderTotal != null
                      ? `${orderTotalIsEstimate ? "≈ " : ""}${orderTotal.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : ""
                  }
                  disabled
                  readOnly
                  title={orderTotalIsEstimate ? t("order_total_estimated") : t("order_total_auto")}
                  className="disabled:opacity-70"
                />
                {orderTotal != null && orderTotalIsEstimate && (
                  <p className="text-xs text-faint">{t("order_total_estimated")}</p>
                )}
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

            <div className="grid gap-1.5">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="staff_notes">{t("staff_notes")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label={t("staff_notes_info_toggle")}
                      className="flex h-4 w-4 items-center justify-center rounded-full border border-line text-[10px] font-semibold leading-none text-faint hover:bg-canvas hover:text-ink"
                    >
                      !
                    </button>
                  </PopoverTrigger>
                  <PopoverContent>{t("staff_notes_info")}</PopoverContent>
                </Popover>
              </div>
              <Textarea
                id="staff_notes"
                value={fields.staff_notes}
                onChange={(e) => setFields((f) => ({ ...f, staff_notes: e.target.value }))}
                placeholder={t("staff_notes_placeholder")}
                maxLength={5000}
                className="border-line"
              />
            </div>

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
              <Button onClick={save} disabled={saving} variant="outline" className={cn(OPS_BUTTON, "w-fit border-line")}>
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
                          e.type === "customer_requested_changes" || e.type === "cancelled"
                            ? "font-semibold text-danger"
                            : "font-medium text-ink"
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
          {cancelled ? (
            <>
              <p className="text-sm text-muted">{t("cancelled_note")}</p>
              <Button onClick={reopen} disabled={reopening} variant="outline" className={cn(OPS_BUTTON, "border-line")}>
                <RotateCcw className="size-3.5" />
                {reopening ? t("reopening") : t("reopen")}
              </Button>
            </>
          ) : order.phase === "delivered" ? (
            <p className="text-sm font-semibold text-leaf">{t("delivered")}</p>
          ) : gate ? (
            <>
              <p className="text-sm text-muted">
                {order.phase === "quote_review" ? t("waiting_note_quote") : t("waiting_note")}
              </p>
              <Button onClick={remind} disabled={reminding} className={cn(OPS_BUTTON, "bg-[#1DA851] text-white hover:bg-[#25D366]")}>
                {reminding ? t("reminding") : t("remind")}
              </Button>
            </>
          ) : (
            <>
              {quoteMissing && <p className="text-sm text-muted">{t("quote_missing_hint")}</p>}
              {advanceError && <p className="text-sm font-semibold text-danger">{advanceError}</p>}
              <Button onClick={advance} disabled={advancing || !next || quoteMissing} className={cn(OPS_BUTTON, "bg-accent text-white hover:bg-accent-2")}>
                {advancing ? t("advancing") : t("advance", { phase: next ? tPhase(next) : "—" })}
              </Button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
