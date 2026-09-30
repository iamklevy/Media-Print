"use client";

import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";

import { PRODUCTS } from "@/content/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SALES_PHONE } from "@/lib/contact";
import { createCustomerArtworkUploadUrls, createOrderFromQuote } from "@/lib/orders/actions";
import { ArtworkInput } from "@/components/site/artwork-input";
import { putToSignedUrl } from "@/lib/storage/signed-upload";
import { QUANTITY_RANGES, isQuantityRange } from "@/lib/orders/quantity";
import { QUOTE_HONEYPOT_FIELD } from "@/lib/orders/quote";

export function QuoteForm() {
  const t = useTranslations();
  const tQty = useTranslations("quantity_ranges");
  const locale = useLocale();
  const ar = locale === "ar";
  const [sent, setSent] = useState(false);
  const [trackingUrl, setTrackingUrl] = useState<string | null>(null);
  const [error, setError] = useState<"generic" | "upload" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Blocks a second submit before React re-renders the disabled button
  // (fast double click, Enter pressed twice).
  const inFlight = useRef(false);
  const successRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const reorderOf = searchParams.get("reorder");
  const reorderProduct = searchParams.get("product") ?? "";
  const reorderQtyParam = searchParams.get("qty") ?? "";
  const reorderQty = isQuantityRange(reorderQtyParam) ? reorderQtyParam : "";
  const defaultMessage = reorderOf
    ? ar
      ? `إعادة طلب — زي طلب رقم ${reorderOf} (${reorderProduct})`
      : `Reorder — same as order ${reorderOf} (${reorderProduct})`
    : "";

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inFlight.current || sent) return;
    inFlight.current = true;
    setSubmitting(true);
    setError(null);
    const f = new FormData(e.currentTarget);

    try {
      // Attached files go straight to Storage; only their paths travel with
      // the Server Action (Vercel rejects function bodies over 4.5MB).
      const artwork = f.getAll("artwork").filter((v): v is File => v instanceof File && v.size > 0);
      f.delete("artwork");
      if (artwork.length > 0) {
        const uploaded = await uploadArtwork(artwork);
        if (!uploaded) {
          setError("upload");
          return;
        }
        uploaded.forEach((entry) => f.append("artwork", JSON.stringify(entry)));
      }

      const order = await createOrderFromQuote(f, locale);
      if (order) {
        setTrackingUrl(order.trackingUrl);
        setSent(true);
        requestAnimationFrame(() => successRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
      } else {
        setError("generic");
      }
    } catch (err) {
      console.error("createOrderFromQuote failed", err);
      setError("generic");
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  // Once sent, the filled-in form is replaced by the confirmation — leaving it
  // on screen with an active "Send" button is what led customers to submit
  // the same request again.
  if (sent) {
    return (
      <div ref={successRef} className="grid gap-2 rounded-lg bg-leaf-soft px-4 py-3 text-[0.9rem] font-semibold text-leaf">
        <p>{ar ? "تم إرسال طلب عرض السعر بنجاح!" : "Your quote request has been sent!"}</p>
        {trackingUrl && (
          <a href={trackingUrl} className="underline underline-offset-2" target="_blank" rel="noopener">
            {ar ? "تابع طلبك من هنا" : "Track your order here"}
          </a>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {reorderOf && (
        <div className="rounded-lg bg-accent-soft px-4 py-3 text-[0.88rem] font-semibold text-accent-2">
          {ar ? `إعادة طلب رقم ${reorderOf}` : `Reordering ${reorderOf}`}
          <input type="hidden" name="source" value="reorder" />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="name" label={t("f.name")} required>
          <Input id="name" name="name" required placeholder={t("f.name_placeholder")} />
        </Field>
        <Field id="company" label={t("f.company")}>
          <Input id="company" name="company" placeholder={t("f.company_placeholder")} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="phone" label={t("f.phone")} required>
          <Input id="phone" name="phone" type="tel" dir="ltr" required placeholder={t("f.phone_placeholder")} />
        </Field>
        <Field id="email" label={t("f.email")} required>
          <Input id="email" name="email" type="email" dir="ltr" required placeholder={t("f.email_placeholder")} />
        </Field>
      </div>

      <Field id="qty" label={t("f.qty")} required>
        {/* native select keeps this form usable with zero JS beyond submit */}
        <select
          id="qty"
          name="qty"
          required
          defaultValue={reorderQty}
          className="h-10 rounded-lg border border-line bg-paper px-3 text-[0.96rem] outline-none focus:border-accent focus:ring-3 focus:ring-accent/12"
        >
          <option value="" disabled>
            {t("f.qty_choose")}
          </option>
          {QUANTITY_RANGES.map((code) => (
            <option key={code} value={code}>
              {tQty(code)}
            </option>
          ))}
        </select>
      </Field>

      <Field id="product" label={t("f.product")}>
        {/* native select keeps this form usable with zero JS beyond submit */}
        <select
          id="product"
          name="product"
          defaultValue={reorderProduct}
          className="h-10 rounded-lg border border-line bg-paper px-3 text-[0.96rem] outline-none focus:border-accent focus:ring-3 focus:ring-accent/12"
        >
          <option value="">{t("f.product_choose")}</option>
          {PRODUCTS.map((p) => (
            <option key={p.slug} value={t(`${p.key}.t`)}>
              {t(`${p.key}.t`)}
            </option>
          ))}
          <option value={t("f.product_other")}>{t("f.product_other")}</option>
        </select>
      </Field>

      <Field id="message" label={t("f.msg")}>
        <Textarea id="message" name="message" rows={4} defaultValue={defaultMessage} placeholder={t("f.msg_placeholder")} />
      </Field>

      <ArtworkInput name="artwork" />

      {/* honeypot — off-screen and skipped by keyboard/screen readers; see QUOTE_HONEYPOT_FIELD */}
      <input
        type="text"
        name={QUOTE_HONEYPOT_FIELD}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="sr-only"
      />

      <Button type="submit" size="lg" disabled={submitting} className="w-fit rounded-full bg-accent hover:bg-accent-2">
        {submitting ? (ar ? "جاري الإرسال…" : "Sending…") : t("f.submit")}
      </Button>

      {error === "upload" && (
        <p className="rounded-lg bg-danger-soft px-4 py-3 text-[0.9rem] font-semibold text-danger">
          {t("f.error_upload")}
        </p>
      )}
      {error === "generic" && (
        <p className="rounded-lg bg-danger-soft px-4 py-3 text-[0.9rem] font-semibold text-danger">
          {ar ? "حصل خطأ في إرسال الطلب — من فضلك اتصل بالمبيعات مباشرة." : "Something went wrong sending your request — please call sales directly."}
        </p>
      )}

      <p className="text-[0.85rem] text-muted">{t("f.note")}</p>
      <p className="text-[0.85rem] text-muted" dir="ltr">
        {SALES_PHONE}
      </p>
    </form>
  );
}

/**
 * Uploads the customer's design files directly to Storage through signed
 * URLs and returns the { path, label } entries createOrderFromQuote expects,
 * or null if any file failed to upload.
 */
async function uploadArtwork(files: File[]): Promise<{ path: string; label: string }[] | null> {
  const targets = await createCustomerArtworkUploadUrls(files.map((file) => ({ name: file.name, size: file.size })));
  if (!targets || targets.length !== files.length) return null;

  const results = await Promise.all(
    files.map(async (file, i) => {
      const put = await putToSignedUrl(targets[i].signedUrl, file);
      return put.ok ? { path: targets[i].path, label: file.name } : null;
    })
  );
  return results.every((r) => r !== null) ? (results as { path: string; label: string }[]) : null;
}

function Field({
  id,
  label,
  required,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-[0.88rem] font-semibold">
        {label} {required && <span className="text-accent-2">*</span>}
      </Label>
      {children}
    </div>
  );
}
