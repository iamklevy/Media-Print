"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Globe, Truck, MapPin, Mail, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { submitBookingRequest } from "@/lib/booking/actions";

type Mode = "online" | "yours" | "ours";

const MODES: { id: Mode; icon: typeof Globe }[] = [
  { id: "online", icon: Globe },
  { id: "yours", icon: Truck },
  { id: "ours", icon: MapPin },
];

/** Tomorrow, skipping Friday (the one day the workshop is closed). */
function defaultDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  if (d.getDay() === 5) d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

type Status = "idle" | "sending" | "sent" | "error";

export function BookingForm() {
  const t = useTranslations();
  const locale = useLocale();
  const [mode, setMode] = useState<Mode>("online");
  const [status, setStatus] = useState<Status>("idle");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    const formData = new FormData(e.currentTarget);
    const res = await submitBookingRequest(formData, locale);
    setStatus(res.ok ? "sent" : "error");
  };

  return (
    <>
      <span id="bmode-label" className="mb-3 block text-[0.78rem] font-bold uppercase tracking-wider text-muted">
        {t("book.mode")}
      </span>
      <div role="radiogroup" aria-labelledby="bmode-label" className="mb-10 grid gap-3 sm:grid-cols-3">
        {MODES.map(({ id, icon: Icon }) => {
          const selected = mode === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setMode(id)}
              className={cn(
                "relative flex flex-col gap-2 rounded-card border-[1.5px] p-4 text-start transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/30",
                selected ? "border-accent bg-accent-soft" : "border-line bg-paper hover:border-accent/50",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute end-4 top-4 grid size-5 place-items-center rounded-full border-[1.5px] transition-colors",
                  selected ? "border-accent bg-accent text-white" : "border-line bg-paper",
                )}
              >
                {selected && <Check className="size-3" strokeWidth={3} />}
              </span>
              <span className="flex items-center gap-2.5 pe-7">
                <Icon className={cn("size-5 shrink-0", selected ? "text-accent-2" : "text-muted")} />
                <h3 className="text-[1rem] leading-snug">{t(`book.${id}.t`)}</h3>
              </span>
              <p className="text-[0.86rem] leading-relaxed text-muted">{t(`book.${id}.d`)}</p>
              <span
                className={cn(
                  "mt-auto w-fit rounded-full px-2.5 py-1 text-[0.76rem] font-bold",
                  selected ? "bg-paper text-accent-2" : "bg-accent-soft text-accent-2",
                )}
              >
                {t(`book.${id}.m`)}
              </span>
            </button>
          );
        })}
      </div>

      <form onSubmit={onSubmit} className="grid gap-4">
        <input type="hidden" name="mode" value={mode} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="bname" label={t("f.name")} required>
            <Input id="bname" name="name" required placeholder={t("f.name_placeholder")} />
          </Field>
          <Field id="bcompany" label={t("f.company")}>
            <Input id="bcompany" name="company" placeholder={t("f.company_placeholder")} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="bphone" label={t("f.phone")} required>
            <Input id="bphone" name="phone" type="tel" dir="ltr" required placeholder={t("f.phone_placeholder")} />
          </Field>
          <Field id="bemail" label={t("f.email")} required>
            <Input id="bemail" name="email" type="email" dir="ltr" required placeholder={t("f.email_placeholder")} />
          </Field>
        </div>

        <Field id="btopic" label={t("book.topic")}>
          <select
            id="btopic"
            name="topic"
            defaultValue=""
            className="h-10 rounded-lg border border-line bg-paper px-3 text-[0.96rem] outline-none focus:border-accent focus:ring-3 focus:ring-accent/12"
          >
            <option value="">{t("book.topic_choose")}</option>
            {["new", "quote", "artwork", "samples", "other"].map((k) => (
              <option key={k} value={t(`book.topic_${k}`)}>
                {t(`book.topic_${k}`)}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="bdate" label={t("book.date")} required>
            <Input
              id="bdate"
              name="date"
              type="date"
              required
              defaultValue={defaultDate()}
              min={new Date().toISOString().slice(0, 10)}
            />
          </Field>
          <Field id="btime" label={t("book.time")} required>
            <Input id="btime" name="time" type="time" required defaultValue="12:00" />
          </Field>
        </div>

        <Field id="bnotes" label={t("book.notes")}>
          <Textarea id="bnotes" name="notes" rows={4} placeholder={t("book.notes_placeholder")} />
        </Field>

        {status === "sent" ? (
          <p className="flex w-fit items-center gap-2 rounded-full bg-leaf-soft px-4 py-2.5 text-[0.92rem] font-semibold text-leaf">
            <Check className="size-4" />
            {t("book.sent")}
          </p>
        ) : (
          <Button
            type="submit"
            size="lg"
            disabled={status === "sending"}
            className="w-fit rounded-full bg-accent hover:bg-accent-2"
          >
            <Mail className="size-4" />
            {status === "sending" ? t("book.sending") : t("book.submit")}
          </Button>
        )}

        {status === "error" && (
          <p className="text-[0.85rem] font-semibold text-danger">{t("book.error")}</p>
        )}

        <p className="text-[0.85rem] text-muted">{t("book.note")}</p>
      </form>
    </>
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
