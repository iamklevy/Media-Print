"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";

import { PRODUCTS } from "@/content/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WhatsAppIcon } from "./brand-icons";
import { waLink, SALES_PHONE } from "@/lib/contact";
import { createOrderFromQuote } from "@/lib/orders/actions";

export function QuoteForm() {
  const t = useTranslations();
  const locale = useLocale();
  const ar = locale === "ar";
  const [sent, setSent] = useState(false);
  const [trackingUrl, setTrackingUrl] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const g = (k: string) => (f.get(k) as string | null)?.trim() ?? "";

    const L = ar
      ? { head: "طلب عرض سعر من الموقع", name: "الاسم", company: "الشركة", phone: "الهاتف",
          product: "المنتج", qty: "الكمية", msg: "التفاصيل", tracking: "متابعة الطلب" }
      : { head: "Quote request from the website", name: "Name", company: "Company",
          phone: "Phone", product: "Product", qty: "Quantity", msg: "Details", tracking: "Track your order" };

    const lines = [`*${L.head}*`, ""];
    (
      [
        ["name", L.name], ["company", L.company], ["phone", L.phone],
        ["product", L.product], ["qty", L.qty], ["message", L.msg],
      ] as const
    ).forEach(([k, label]) => {
      const v = g(k);
      if (v) lines.push(`${label}: ${v}`);
    });

    // Best-effort: order tracking must never block the WhatsApp handoff below,
    // which is the site's actual conversion path.
    try {
      const order = await createOrderFromQuote(f, locale);
      if (order) {
        lines.push("", `${L.tracking}: ${order.trackingUrl}`);
        setTrackingUrl(order.trackingUrl);
      }
    } catch (err) {
      console.error("createOrderFromQuote failed", err);
    }

    window.open(waLink(lines.join("\n")), "_blank", "noopener");
    setSent(true);
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
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
        <Field id="qty" label={t("f.qty")}>
          <Input id="qty" name="qty" placeholder={t("f.qty_placeholder")} />
        </Field>
      </div>

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
        <Textarea id="message" name="message" rows={4} placeholder={t("f.msg_placeholder")} />
      </Field>

      <Button type="submit" size="lg" className="w-fit rounded-full bg-accent hover:bg-accent-2">
        <WhatsAppIcon className="size-4" />
        {t("f.submit")}
      </Button>

      {sent && (
        <div className="grid gap-2 rounded-lg bg-leaf-soft px-4 py-3 text-[0.9rem] font-semibold text-leaf">
          <p>
            {ar
              ? "فتحنا لك واتساب بالرسالة جاهزة — دوس إرسال."
              : "WhatsApp is open with your message ready — just press send."}
          </p>
          {trackingUrl && (
            <a href={trackingUrl} className="underline underline-offset-2" target="_blank" rel="noopener">
              {ar ? "تابع طلبك من هنا" : "Track your order here"}
            </a>
          )}
        </div>
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
