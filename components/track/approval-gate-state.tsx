"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { approveGate, requestChanges } from "@/lib/orders/actions";
import { downloadUrl } from "@/lib/utils";
import type { Order, OrderEvent } from "@/lib/orders/types";

export function ApprovalGateState({
  order,
  onChanged,
}: {
  order: Order;
  onChanged: (order: Order, events?: OrderEvent[]) => void;
}) {
  const t = useTranslations("track.approval");
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [pending, setPending] = useState<"approve" | "revise" | null>(null);
  const [error, setError] = useState(false);

  const isSample = order.phase === "sample_approved";

  async function onApprove() {
    setPending("approve");
    setError(false);
    try {
      const res = await approveGate(order.tracking_slug);
      // Applying the order the action already returns — no second round-trip
      // to re-fetch what we were just handed — is what makes this feel instant.
      if (res.ok && res.order) onChanged(res.order, res.events);
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setPending(null);
    }
  }

  async function onRequestChanges() {
    if (!showNote) {
      setShowNote(true);
      return;
    }
    setPending("revise");
    setError(false);
    try {
      const res = await requestChanges(order.tracking_slug, note);
      if (res.ok && res.order) onChanged(res.order, res.events);
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="mx-auto grid max-w-lg gap-4 rounded-[18px] border-2 border-amber bg-amber-soft p-6">
      <div>
        <p className="text-sm font-semibold text-amber">{t("badge")}</p>
        <h1 className="text-lg font-bold text-ink">{isSample ? t("sample_title") : t("artwork_title")}</h1>
        <p className="text-sm text-muted">{order.order_number}</p>
      </div>

      {isSample && order.sample_images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {order.sample_images.map((img, i) => {
            if (!img.url) return null;
            const filename = `${order.order_number}-sample-${i + 1}.jpg`;
            return (
              <a
                key={i}
                href={downloadUrl(img.url, filename)}
                download={filename}
                target="_blank"
                rel="noopener"
                className="relative block aspect-square overflow-hidden rounded-lg border border-line active:opacity-80"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.label ?? `Sample ${i + 1}`}
                  className="size-full object-cover"
                />
                {/* Always visible, not hover-only — most customers open this link on a
                    phone, where :hover never fires and the download affordance would
                    otherwise be invisible. */}
                <span className="absolute end-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-ink/70 text-paper shadow-lift backdrop-blur-sm">
                  <Download className="size-3.5" />
                </span>
              </a>
            );
          })}
        </div>
      )}
      {isSample && order.sample_images.some((img) => img.url) && (
        <p className="text-xs text-muted">{t("download_hint")}</p>
      )}

      <div className="grid gap-2 rounded-lg bg-paper p-4">
        {error && <p className="text-sm font-semibold text-danger">{t("error")}</p>}
        <Button onClick={onApprove} disabled={pending !== null} className="bg-leaf hover:bg-leaf/90">
          {pending === "approve" ? t("approving") : t("approve")}
        </Button>

        {showNote && (
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("changes_placeholder")}
            rows={3}
          />
        )}

        <Button onClick={onRequestChanges} disabled={pending !== null} variant="outline" className="border-line">
          {pending === "revise" ? t("submitting") : showNote ? t("changes_submit") : t("request_changes")}
        </Button>
      </div>

      <p className="text-sm text-muted">{t("footer_note")}</p>
    </div>
  );
}
