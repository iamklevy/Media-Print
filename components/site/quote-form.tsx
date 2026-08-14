"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";

import { PRODUCTS } from "@/content/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SALES_PHONE } from "@/lib/contact";
import { createOrderFromQuote } from "@/lib/orders/actions";

export function QuoteForm() {
  const t = useTranslations();
  const locale = useLocale();
  const ar = locale === "ar";
  const [sent, setSent] = useState(false);
  const [trackingUrl, setTrackingUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const searchParams = useSearchParams();
  const reorderOf = searchParams.get("reorder");
  const reorderProduct = searchParams.get("product") ?? "";
  const reorderQty = searchParams.get("qty") ?? "";
  const defaultMessage = reorderOf
    ? ar
      ? `إعادة طلب — زي طلب رقم ${reorderOf} (${reorderProduct})`
      : `Reorder — same as order ${reorderOf} (${reorderProduct})`
    : "";

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(false);
    const f = new FormData(e.currentTarget);

    try {
      const order = await createOrderFromQuote(f, locale);
      if (order) {
        setTrackingUrl(order.trackingUrl);
        setSent(true);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("createOrderFromQuote failed", err);
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

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

      <Field id="qty" label={t("f.qty")}>
        <Input id="qty" name="qty" defaultValue={reorderQty} placeholder={t("f.qty_placeholder")} />
      </Field>

      <Field id="product" label={t("f.product")}>
        {/* native select keeps this form usable with zero JS beyond submit */}
        <select
          id="product"
          name="product"
          defaultValue=""
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

      <Button type="submit" size="lg" disabled={submitting} className="w-fit rounded-full bg-accent hover:bg-accent-2">
        {submitting ? (ar ? "جاري الإرسال…" : "Sending…") : t("f.submit")}
      </Button>

      {sent && (
        <div className="grid gap-2 rounded-lg bg-leaf-soft px-4 py-3 text-[0.9rem] font-semibold text-leaf">
          <p>{ar ? "تم إرسال طلب عرض السعر بنجاح!" : "Your quote request has been sent!"}</p>
          {trackingUrl && (
            <a href={trackingUrl} className="underline underline-offset-2" target="_blank" rel="noopener">
              {ar ? "تابع طلبك من هنا" : "Track your order here"}
            </a>
          )}
        </div>
      )}

      {error && (
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
