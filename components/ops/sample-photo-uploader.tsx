"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Upload, X } from "lucide-react";

import { Label } from "@/components/ui/label";
import { uploadSampleImage, removeSampleImage } from "@/lib/orders/actions";
import { isVideoUrl } from "@/lib/utils";
import type { SampleImage } from "@/lib/orders/types";

const SLOTS = [0, 1, 2];

export function SamplePhotoUploader({
  orderId,
  images,
  onChanged,
}: {
  orderId: string;
  images: SampleImage[];
  onChanged: (images: SampleImage[]) => void;
}) {
  const t = useTranslations("ops.detail");
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  async function onPick(slot: number, file: File | undefined) {
    if (!file) return;
    setBusy(slot);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await uploadSampleImage(orderId, slot, fd);
      if (!res.ok) {
        setError(res.error ?? "Upload failed.");
        return;
      }
      const next = [...images];
      while (next.length <= slot) next.push({ url: "" });
      next[slot] = { url: res.url! };
      onChanged(next);
    } catch {
      // Server actions reject outright (rather than returning { ok: false })
      // when the request itself is too large for Next's body-size limit —
      // without this catch, that failure would only show up in server logs.
      setError(t("upload_too_large"));
    } finally {
      setBusy(null);
    }
  }

  async function onRemove(slot: number) {
    setBusy(slot);
    setError(null);
    await removeSampleImage(orderId, slot);
    setBusy(null);
    const next = [...images];
    if (next[slot]) next[slot] = { url: "" };
    onChanged(next);
  }

  return (
    <div className="grid gap-1.5">
      <Label>{t("sample_photos")}</Label>
      <p className="text-xs text-faint">{t("sample_photos_hint")}</p>
      <div className="grid grid-cols-3 gap-2">
        {SLOTS.map((slot) => {
          const url = images[slot]?.url?.trim();
          return (
            <div
              key={slot}
              onDragOver={(e) => {
                e.preventDefault();
                if (busy === null) setDragOver(slot);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(null);
                if (busy === null) onPick(slot, e.dataTransfer.files?.[0]);
              }}
              className={`relative aspect-square overflow-hidden rounded-lg border bg-paper-2 ${
                dragOver === slot ? "border-accent ring-2 ring-accent/30" : "border-line"
              }`}
            >
              {url ? (
                isVideoUrl(url) ? (
                  <video src={url} className="size-full object-cover" controls playsInline />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt="" className="size-full object-cover" />
                )
              ) : (
                <button
                  type="button"
                  onClick={() => inputRefs.current[slot]?.click()}
                  disabled={busy !== null}
                  className="grid size-full place-items-center text-faint hover:text-muted"
                >
                  <Upload className="size-5" />
                </button>
              )}
              {busy === slot && (
                <div className="absolute inset-0 grid place-items-center bg-paper/70 text-xs text-muted">…</div>
              )}
              {url && busy === null && (
                <button
                  type="button"
                  onClick={() => onRemove(slot)}
                  aria-label={t("remove_photo")}
                  className="absolute end-1 top-1 grid size-5 place-items-center rounded-full bg-ink/70 text-paper hover:bg-ink"
                >
                  <X className="size-3" />
                </button>
              )}
              <input
                ref={(el) => {
                  inputRefs.current[slot] = el;
                }}
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
                className="hidden"
                onChange={(e) => onPick(slot, e.target.files?.[0])}
              />
            </div>
          );
        })}
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
