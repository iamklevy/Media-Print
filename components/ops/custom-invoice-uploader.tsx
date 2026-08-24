"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { FileText, Upload, X } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { uploadCustomInvoice, removeCustomInvoice } from "@/lib/orders/actions";
import type { ArtworkFile } from "@/lib/orders/types";

export function CustomInvoiceUploader({
  orderId,
  file,
  onChanged,
}: {
  orderId: string;
  file: ArtworkFile | null;
  onChanged: (file: ArtworkFile | null) => void;
}) {
  const t = useTranslations("ops.detail");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function onPick(picked: File | undefined) {
    if (!picked) return;
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("file", picked);
      const res = await uploadCustomInvoice(orderId, fd);
      if (!res.ok) {
        setError(res.error ?? t("invoice_upload_failed"));
        return;
      }
      onChanged({ url: res.url!, label: picked.name });
    } catch {
      setError(t("invoice_upload_failed"));
    } finally {
      setBusy(false);
    }
  }

  async function onRemove() {
    setBusy(true);
    setError(null);
    await removeCustomInvoice(orderId);
    setBusy(false);
    onChanged(null);
  }

  return (
    <div className="grid gap-1.5">
      <Label>{t("custom_invoice")}</Label>
      <p className="text-xs text-faint">{t("custom_invoice_hint")}</p>
      {file?.url ? (
        <div className="flex items-center gap-2 rounded-md border border-line bg-paper-2 px-2.5 py-1.5 text-sm">
          <FileText className="size-4 shrink-0 text-muted" />
          <a
            href={file.url}
            target="_blank"
            rel="noopener"
            className="min-w-0 flex-1 truncate text-ink/80 hover:text-accent"
          >
            {file.label ?? t("custom_invoice")}
          </a>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-faint hover:text-danger"
            onClick={onRemove}
            disabled={busy}
            aria-label={t("remove_invoice")}
          >
            <X className="size-3.5" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-fit border-line"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          <Upload className="size-4" />
          {busy ? t("uploading") : t("upload_invoice")}
        </Button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0])}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
