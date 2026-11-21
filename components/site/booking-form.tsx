"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { CalendarDays, Check, Clock, Globe, MapPin, Truck } from "lucide-react";

import { btnPrimary } from "./buttons";
import { MapEmbed } from "./map-embed";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { submitBookingRequest } from "@/lib/booking/actions";
import { BOOKING_SLOTS, bookableDays } from "@/lib/booking/slots";

type Mode = "online" | "yours" | "ours";

const MODES: { id: Mode; icon: typeof Globe }[] = [
  { id: "online", icon: Globe },
  { id: "yours", icon: Truck },
  { id: "ours", icon: MapPin },
];

const TOPICS = ["new", "quote", "artwork", "samples", "other"] as const;

type Status = "idle" | "sending" | "sent" | "error";

// every choice on the page is a real radio input (so it posts and works with
// the keyboard) hidden behind a styled label; `peer-checked` draws the selection
const PICK =
  "cursor-pointer border transition-colors peer-focus-visible:ring-3 peer-focus-visible:ring-accent/30";
const PICK_OFF = "border-ink/15 bg-white/60 text-ink hover:border-ink/35";
const PICK_ON = "peer-checked:border-accent peer-checked:bg-accent peer-checked:text-white";

/**
 * Booking in three calm steps — how, when, who — with a summary card beside
 * them (sticky on desktop) that holds the Book button and changes with the
 * meeting type: the map and opening hours only when they're coming to us.
 * Days and times are offered as chips, so a closed day or hour can't be
 * picked; the server checks the same rules (lib/booking/slots.ts).
 */
export function BookingForm() {
  const t = useTranslations();
  const locale = useLocale();
  const ar = locale === "ar";
  const [mode, setMode] = useState<Mode>("online");
  const [days] = useState(() => bookableDays());
  const [date, setDate] = useState(days[0]);
  const [time, setTime] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const sentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (status === "sent") sentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [status]);

  // Western digits, like the rest of the site; dates are plain calendar days
  const intlLocale = ar ? "ar-EG-u-nu-latn" : "en-GB";
  const fmt = (iso: string, o: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(intlLocale, { ...o, timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
  const fmtTime = (hhmm: string) =>
    new Intl.DateTimeFormat(ar ? "ar-EG-u-nu-latn" : "en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "UTC",
    }).format(new Date(`1970-01-01T${hhmm}:00Z`));
  const when = time
    ? `${fmt(date, { weekday: "long", day: "numeric", month: "long" })} · ${fmtTime(time)}`
    : null;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!time || status === "sending") return;
    setStatus("sending");
    const res = await submitBookingRequest(new FormData(e.currentTarget), locale);
    setStatus(res.ok ? "sent" : "error");
  };

  const ModeIcon = MODES.find((m) => m.id === mode)!.icon;

  // Once sent, the form gives way to the confirmation, so it can't be sent twice.
  if (status === "sent") {
    return (
      <div ref={sentRef} className="mx-auto flex max-w-[520px] flex-col items-center rounded-[28px] bg-paper-2 px-6 py-12 text-center sm:px-10">
        <span className="grid size-14 place-items-center rounded-full bg-accent text-white">
          <Check className="size-7" strokeWidth={2.5} />
        </span>
        <h2 className="mt-6 font-display text-[clamp(1.8rem,1.4rem+1.4vw,2.4rem)] text-ink">{t("book.sent_t")}</h2>
        <p className="mt-3 max-w-[38ch] leading-relaxed text-muted">{t("book.sent")}</p>
        <ul className="mt-8 grid w-full gap-3 rounded-2xl bg-paper p-5 text-start text-[0.95rem] text-ink">
          <li className="flex items-center gap-3">
            <ModeIcon className="size-4 shrink-0 text-accent" />
            {t(`book.${mode}.t`)}
          </li>
          <li className="flex items-center gap-3">
            <CalendarDays className="size-4 shrink-0 text-accent" />
            {when}
          </li>
        </ul>
        <button
          type="button"
          onClick={() => {
            setTime("");
            setStatus("idle");
          }}
          className="mt-8 text-[0.92rem] font-semibold text-accent underline-offset-4 hover:underline"
        >
          {t("book.edit")}
        </button>
      </div>
    );
  }

  // grid-cols-1 + min-w-0: the swipeable day row scrolls inside its column
  // instead of stretching the whole form wider than the phone
  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 items-start gap-14 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
      <div className="grid min-w-0 grid-cols-1 gap-14">
        {/* ---- 1. how */}
        <Step n={1} title={t("book.step_how")}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {MODES.map(({ id, icon: Icon }) => (
              <label key={id} className="relative flex">
                <input
                  type="radio"
                  name="mode"
                  value={id}
                  checked={mode === id}
                  onChange={() => setMode(id)}
                  className="peer sr-only"
                />
                {/* phones and small tablets: a compact row (icon beside the text); from md up: a card */}
                <span
                  className={cn(
                    "flex w-full items-start gap-4 rounded-[20px] border-[1.5px] p-4 transition-colors peer-focus-visible:ring-3 peer-focus-visible:ring-accent/30 md:flex-col md:gap-0 md:p-5",
                    mode === id ? "border-accent bg-accent-soft" : "cursor-pointer border-ink/12 bg-white/60 hover:border-ink/30",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-11 shrink-0 place-items-center rounded-full transition-colors",
                      mode === id ? "bg-accent text-white" : "bg-paper-2 text-accent",
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col self-stretch">
                    <span className="font-display text-[1.15rem] text-ink md:mt-4 md:text-[1.25rem] rtl:text-[1.3rem]">
                      {t(`book.${id}.t`)}
                    </span>
                    <span className="mt-1 text-[0.86rem] leading-relaxed text-muted md:mt-2">{t(`book.${id}.d`)}</span>
                    <span className="mt-auto pt-2 text-[0.82rem] font-semibold text-accent-2 md:pt-4">{t(`book.${id}.m`)}</span>
                  </span>
                </span>
              </label>
            ))}
          </div>
        </Step>

        {/* ---- 2. when */}
        <Step n={2} title={t("book.step_when")} hint={t("book.when_hint")}>
          {/* fieldsets default to min-width: min-content, which would stretch to all
              ten days and stop the row from scrolling */}
          <fieldset className="min-w-0">
            <legend className="mb-3 text-[0.88rem] font-semibold text-ink">{t("book.day")}</legend>
            {/* phones: one swipeable row to the screen edges; wraps from sm up */}
            <div className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-2 overflow-x-auto overscroll-x-contain px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
              {days.map((d) => (
                <label key={d} className="shrink-0 snap-start">
                  <input
                    type="radio"
                    name="date"
                    value={d}
                    checked={date === d}
                    onChange={() => setDate(d)}
                    className="peer sr-only"
                  />
                  <span
                    className={cn(
                      PICK,
                      PICK_OFF,
                      PICK_ON,
                      "flex w-[68px] flex-col items-center rounded-2xl py-2.5 leading-tight",
                    )}
                  >
                    <span className="text-[0.75rem] font-semibold opacity-75">{fmt(d, { weekday: "short" })}</span>
                    <span className="my-0.5 font-display text-[1.45rem]">{fmt(d, { day: "numeric" })}</span>
                    <span className="text-[0.75rem] opacity-75">{fmt(d, { month: "short" })}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-7 min-w-0">
            <legend className="mb-3 text-[0.88rem] font-semibold text-ink">{t("book.slot")}</legend>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-4 xl:grid-cols-6">
              {BOOKING_SLOTS.map((s) => (
                <label key={s}>
                  <input
                    type="radio"
                    name="time"
                    value={s}
                    checked={time === s}
                    onChange={() => setTime(s)}
                    className="peer sr-only"
                  />
                  <span
                    className={cn(PICK, PICK_OFF, PICK_ON, "flex h-11 items-center justify-center rounded-full text-[0.88rem] font-semibold")}
                  >
                    {fmtTime(s)}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </Step>

        {/* ---- 3. who */}
        <Step n={3} title={t("book.step_who")}>
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="bname" label={t("f.name")} required>
                <Input id="bname" className="h-11" name="name" required placeholder={t("f.name_placeholder")} />
              </Field>
              <Field id="bcompany" label={t("f.company")}>
                <Input id="bcompany" className="h-11" name="company" placeholder={t("f.company_placeholder")} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="bphone" label={t("f.phone")} required>
                <Input id="bphone" className="h-11" name="phone" type="tel" dir="ltr" required placeholder={t("f.phone_placeholder")} />
              </Field>
              <Field id="bemail" label={t("f.email")} required>
                <Input id="bemail" className="h-11" name="email" type="email" dir="ltr" required placeholder={t("f.email_placeholder")} />
              </Field>
            </div>

            <fieldset className="mt-2 min-w-0">
              <legend className="mb-3 text-[0.88rem] font-semibold">{t("book.topic")}</legend>
              <div className="flex flex-wrap gap-2">
                {TOPICS.map((k) => (
                  <label key={k}>
                    <input type="radio" name="topic" value={t(`book.topic_${k}`)} className="peer sr-only" />
                    <span className={cn(PICK, PICK_OFF, PICK_ON, "flex h-11 items-center rounded-full px-4 text-[0.9rem] font-semibold")}>
                      {t(`book.topic_${k}`)}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <Field id="bnotes" label={t("book.notes")}>
              <Textarea id="bnotes" name="notes" rows={4} placeholder={t("book.notes_placeholder")} />
            </Field>
          </div>
        </Step>
      </div>

      {/* ---- summary + the Book button; sticky beside the steps on desktop */}
      <aside className="lg:sticky lg:top-28">
        <div className="rounded-[24px] bg-paper-2 p-6 sm:p-7">
          <h2 className="font-display text-[1.5rem] text-ink rtl:text-[1.65rem]">{t("book.summary")}</h2>
          <ul className="mt-5 grid gap-3.5 text-[0.95rem] text-ink">
            <li className="flex gap-3">
              <ModeIcon className="mt-[3px] size-4 shrink-0 text-accent" />
              {t(`book.${mode}.t`)}
            </li>
            <li className="flex gap-3">
              <CalendarDays className="mt-[3px] size-4 shrink-0 text-accent" />
              {when ?? <span className="text-muted">{t("book.pick_time")}</span>}
            </li>
          </ul>

          <div className="mt-5 border-t border-ink/10 pt-5 text-[0.9rem] leading-relaxed text-muted">
            {mode === "online" && <p>{t("book.sum_online")}</p>}
            {mode === "yours" && <p>{t("book.sum_yours")}</p>}
            {mode === "ours" && (
              <div className="grid gap-3">
                <p className="flex gap-3">
                  <MapPin className="mt-[3px] size-4 shrink-0 text-accent" />
                  {t("c.addr.v")}
                </p>
                <p className="flex gap-3">
                  <Clock className="mt-[3px] size-4 shrink-0 text-accent" />
                  {t("c.hours.v")}
                </p>
                <MapEmbed title={t("c.map_title")} className="mt-1 min-h-[220px] rounded-2xl" />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!time || status === "sending"}
            className={cn(btnPrimary, "mt-6 w-full")}
          >
            {status === "sending" ? t("book.sending") : t("book.submit")}
          </button>
          {status === "error" && (
            <p className="mt-3 text-[0.85rem] font-semibold text-danger">{t("book.error")}</p>
          )}
          <p className="mt-3 text-center text-[0.82rem] text-muted">{t("book.note")}</p>
        </div>
      </aside>
    </form>
  );
}

function Step({
  n,
  title,
  hint,
  children,
}: {
  n: number;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-6 flex items-start gap-3">
        <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-accent text-[0.85rem] font-bold text-white">
          {n}
        </span>
        <div>
          <h2 className="font-display text-[clamp(1.5rem,1.25rem+0.9vw,1.9rem)] text-ink rtl:text-[clamp(1.65rem,1.4rem+1vw,2.1rem)]">
            {title}
          </h2>
          {hint && <p className="mt-1.5 text-[0.9rem] text-muted">{hint}</p>}
        </div>
      </div>
      {children}
    </section>
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
