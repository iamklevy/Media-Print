"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { approveGate, requestChanges } from "@/lib/orders/actions";
import type { Order } from "@/lib/orders/types";

export function ApprovalGateState({ order }: { order: Order }) {
  const t = useTranslations("track.approval");
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [pending, setPending] = useState<"approve" | "revise" | null>(null);

  const isSample = order.phase === "sample_approved";

  async function onApprove() {
    setPending("approve");
    await approveGate(order.tracking_slug);
    setPending(null);
  }

  async function onRequestChanges() {
    if (!showNote) {
      setShowNote(true);
      return;
    }
    setPending("revise");
    await requestChanges(order.tracking_slug, note);
    setPending(null);
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
          {order.sample_images.map((img, i) =>
            img.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={img.url} alt={img.label ?? `Sample ${i + 1}`} className="aspect-square w-full rounded-lg border border-line object-cover" />
            ) : null
          )}
        </div>
      )}

      <div className="grid gap-2 rounded-lg bg-paper p-4">
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
