"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Paperclip, X } from "lucide-react";

import { Label } from "@/components/ui/label";

const MAX_FILES = 3;
const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = ".pdf,.ai,.eps,.svg,.png,.jpg,.jpeg,.webp,.zip";
const EXT_RE = /\.(pdf|ai|eps|svg|png|jpe?g|webp|zip)$/i;

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Lets a customer attach their design file(s) to the quote form. The real
 * <input type="file"> stays in sync via DataTransfer so the surrounding
 * <form>'s native FormData already carries the current file list on submit
 * — no extra wiring needed in the parent form's submit handler.
 */
export function ArtworkInput({ name }: { name: string }) {
  const t = useTranslations("f");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  function syncInput(list: File[]) {
    const dt = new DataTransfer();
    list.forEach((f) => dt.items.add(f));
    if (inputRef.current) inputRef.current.files = dt.files;
  }

  function onPick(picked: FileList | null) {
    if (!picked || picked.length === 0) return;
    setError(null);

    const combined = [...files, ...Array.from(picked)];
    if (combined.length > MAX_FILES) {
      setError(t("artwork_too_many"));
      return;
    }
    for (const f of picked) {
      if (f.size > MAX_BYTES) {
        setError(t("artwork_too_large"));
        return;
      }
      if (!EXT_RE.test(f.name)) {
        setError(t("artwork_bad_type"));
        return;
      }
    }

    setFiles(combined);
    syncInput(combined);
  }

  function removeFile(index: number) {
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    syncInput(next);
    setError(null);
  }

  return (
    <div className="grid gap-1.5">
      <Label>{t("artwork")}</Label>
      <input
        ref={inputRef}
        type="file"
        name={name}
        multiple
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => onPick(e.target.files)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={files.length >= MAX_FILES}
        className="flex w-fit items-center gap-2 rounded-lg border border-line bg-paper px-3 py-2 text-[0.88rem] font-semibold text-ink hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Paperclip className="size-4" />
        {t("artwork_add")}
      </button>

      {files.length > 0 && (
        <ul className="grid gap-1.5">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${f.size}-${i}`}
              className="flex items-center justify-between gap-2 rounded-md bg-paper-2 px-2.5 py-1.5 text-[0.85rem]"
            >
              <span className="min-w-0 flex-1 truncate text-ink/80">
                {f.name} <span className="text-faint">· {formatSize(f.size)}</span>
              </span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                aria-label={t("artwork_remove")}
                className="shrink-0 text-faint hover:text-danger"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {error ? <p className="text-xs text-danger">{error}</p> : <p className="text-xs text-faint">{t("artwork_hint")}</p>}
    </div>
  );
}
