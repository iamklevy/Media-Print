"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Upload, X } from "lucide-react";

import { Label } from "@/components/ui/label";
import { uploadArtworkFile, removeArtworkFile } from "@/lib/orders/actions";
import type { ArtworkFile } from "@/lib/orders/types";

const SLOTS = [0, 1, 2];

export function ArtworkFileUploader({
  orderId,
  files,
  onChanged,
}: {
  orderId: string;
  files: ArtworkFile[];
  onChanged: (files: ArtworkFile[]) => void;
}) {
  const t = useTranslations("ops.detail");
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  async function onPick(slot: number, file: File | undefined) {
    if (!file) return;
    setBusy(slot);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await uploadArtworkFile(orderId, slot, fd);
      if (!res.ok) {
        setError(res.error ?? "Upload failed.");
        return;
      }
      const next = [...files];
      while (next.length <= slot) next.push({ url: "" });
      next[slot] = { url: res.url! };
      onChanged(next);
    } catch {
      setError(t("upload_too_large"));
    } finally {
      setBusy(null);
    }
  }

  async function onRemove(slot: number) {
    setBusy(slot);
    setError(null);
    await removeArtworkFile(orderId, slot);
    setBusy(null);
    const next = [...files];
    if (next[slot]) next[slot] = { url: "" };
    onChanged(next);
  }

  return (
    <div className="grid gap-1.5">
      <Label>{t("artwork_files")}</Label>
      <p className="text-xs text-faint">{t("artwork_files_hint")}</p>
      <div className="grid grid-cols-3 gap-2">
        {SLOTS.map((slot) => {
          const url = files[slot]?.url?.trim();
          return (
            <div
              key={slot}
              className="relative aspect-square overflow-hidden rounded-lg border border-line bg-paper-2"
            >
              {url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt="" className="size-full object-cover" />
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
                accept="image/jpeg,image/png,image/webp"
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
