"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyCustomerPhone } from "@/lib/orders/actions";

export function PhoneGateForm({ slug }: { slug: string }) {
  const t = useTranslations("track.gate");
  const router = useRouter();
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<"mismatch" | "locked" | "not_found" | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await verifyCustomerPhone(slug, value);
    setPending(false);
    if (res.ok) {
      router.refresh();
    } else {
      setError(res.reason ?? "mismatch");
    }
  }

  return (
    <div className="mx-auto grid max-w-sm gap-4 rounded-[18px] border border-line bg-paper p-6 shadow-soft">
      <div>
        <h1 className="text-lg font-bold">{t("title")}</h1>
        <p className="text-sm text-muted">{t("subtitle")}</p>
      </div>
      <form onSubmit={onSubmit} className="grid gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="last4">{t("label")}</Label>
          <Input
            id="last4"
            inputMode="numeric"
            dir="ltr"
            maxLength={4}
            autoFocus
            placeholder={t("placeholder")}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm font-semibold text-danger">{t(`error_${error}`)}</p>}
        <Button type="submit" disabled={pending || value.length < 4} className="bg-accent hover:bg-accent-2">
          {pending ? t("checking") : t("submit")}
        </Button>
      </form>
    </div>
  );
}
