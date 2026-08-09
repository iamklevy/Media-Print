"use client";

import { useState } from "react";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/orders/status-badge";
import { deriveStatus } from "@/lib/orders/status";
import { PHASES, isGatePhase, nextPhase, phaseIndex } from "@/lib/orders/phases";
import { waLinkTo } from "@/lib/contact";
import { advancePhase, sendReminder, updateOrderFields } from "@/lib/orders/actions";
import type { Order, SampleImage } from "@/lib/orders/types";

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
  const [fields, setFields] = useState({
    product_label: order.product_label,
    quantity: order.quantity,
    unit_price: order.unit_price?.toString() ?? "",
    order_total: order.order_total?.toString() ?? "",
    lead_time_days: order.lead_time_days?.toString() ?? "",
    estimated_delivery: order.estimated_delivery ?? "",
  });
  const [sampleImages, setSampleImages] = useState<SampleImage[]>(
    order.sample_images.length ? order.sample_images : [{ url: "" }, { url: "" }, { url: "" }]
  );
  const [saving, setSaving] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [reminding, setReminding] = useState(false);

  const status = deriveStatus(order);
  const gate = isGatePhase(order.phase);
  const next = nextPhase(order.phase);
  const showSampleImages = order.phase === "sample_produced" || order.phase === "sample_approved";

  async function save() {
    setSaving(true);
    await updateOrderFields(order.id, {
      product_label: fields.product_label,
      quantity: fields.quantity,
      unit_price: fields.unit_price ? Number(fields.unit_price) : null,
      order_total: fields.order_total ? Number(fields.order_total) : null,
      lead_time_days: fields.lead_time_days ? Number(fields.lead_time_days) : null,
      estimated_delivery: fields.estimated_delivery || null,
      sample_images: showSampleImages ? sampleImages.filter((s) => s.url.trim()) : undefined,
    });
    setSaving(false);
    onChanged();
  }

  async function advance() {
    setAdvancing(true);
    await advancePhase(order.id);
    setAdvancing(false);
    onChanged();
    onOpenChange(false);
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
      <SheetContent className="w-full gap-0 overflow-y-auto bg-paper text-ink sm:max-w-md">
        <SheetHeader className="border-b border-line">
          <SheetTitle className="text-ink">{order.order_number}</SheetTitle>
          <SheetDescription>
            {order.customer_name}
            {order.customer_company ? ` · ${order.customer_company}` : ""} · <span dir="ltr">{order.customer_phone}</span>
          </SheetDescription>
          <StatusBadge status={status} className="mt-1" />
        </SheetHeader>

        <div className="grid gap-5 p-4">
          <section className="grid gap-3">
            <h3 className="text-xs font-semibold tracking-wide text-muted uppercase">Order details</h3>
            <div className="grid gap-1.5">
              <Label htmlFor="product_label">Product</Label>
              <Input
                id="product_label"
                value={fields.product_label}
                onChange={(e) => setFields((f) => ({ ...f, product_label: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  value={fields.quantity}
                  onChange={(e) => setFields((f) => ({ ...f, quantity: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="lead_time_days">Lead time (days)</Label>
                <Input
                  id="lead_time_days"
                  type="number"
                  min={0}
                  value={fields.lead_time_days}
                  onChange={(e) => setFields((f) => ({ ...f, lead_time_days: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="unit_price">Unit price (EGP)</Label>
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
                <Label htmlFor="order_total">Order total (EGP)</Label>
                <Input
                  id="order_total"
                  type="number"
                  min={0}
                  step="0.01"
                  value={fields.order_total}
                  onChange={(e) => setFields((f) => ({ ...f, order_total: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="estimated_delivery">Estimated delivery</Label>
              <Input
                id="estimated_delivery"
                type="date"
                value={fields.estimated_delivery}
                onChange={(e) => setFields((f) => ({ ...f, estimated_delivery: e.target.value }))}
              />
            </div>

            {showSampleImages && (
              <div className="grid gap-1.5">
                <Label>Sample photo URLs</Label>
                {sampleImages.map((img, i) => (
                  <Input
                    key={i}
                    placeholder={`Sample ${i + 1} image URL`}
                    value={img.url}
                    onChange={(e) =>
                      setSampleImages((prev) => prev.map((p, j) => (j === i ? { ...p, url: e.target.value } : p)))
                    }
                  />
                ))}
              </div>
            )}

            <Button onClick={save} disabled={saving} variant="outline" className="w-fit border-line">
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </section>

          <section className="grid gap-2">
            <h3 className="text-xs font-semibold tracking-wide text-muted uppercase">Pipeline</h3>
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
                    {p.label}
                    {current && p.gate && <span className="text-xs font-normal text-amber">— your turn</span>}
                  </li>
                );
              })}
            </ol>
          </section>
        </div>

        <SheetFooter className="border-t border-line">
          {order.phase === "delivered" ? (
            <p className="text-sm font-semibold text-leaf">Delivered.</p>
          ) : gate ? (
            <>
              <p className="text-sm text-muted">Waiting on the customer to respond — nudge them if it&apos;s been a while.</p>
              <Button onClick={remind} disabled={reminding} className="bg-accent hover:bg-accent-2">
                {reminding ? "Sending…" : "Send WhatsApp reminder"}
              </Button>
            </>
          ) : (
            <Button onClick={advance} disabled={advancing || !next} className="bg-accent hover:bg-accent-2">
              {advancing ? "Advancing…" : `Advance to ${next ? PHASES.find((p) => p.key === next)?.label : "—"}`}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
