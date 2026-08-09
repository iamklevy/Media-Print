"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ChevronDown, Check, Minus, Plus } from "lucide-react";
import { WhatsAppIcon } from "./brand-icons";

import { PRICING, type PricedProduct } from "@/content/pricing";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { waLink } from "@/lib/contact";

/** Which tier a quantity falls into. */
function tierIndex(tiers: number[], qty: number) {
  let i = 0;
  for (let k = 0; k < tiers.length; k++) if (qty >= tiers[k]) i = k;
  return i;
}

type State = { variant: number; qty: number; printing: boolean; finish: string };

function initialState(p: PricedProduct): State {
  return {
    variant: 0,
    qty:
      p.model === "finish"
        ? (p.variants[0].moq ?? 100)
        : p.model === "perKg"
          ? 100
          : (p.tiers?.[0] ?? 100),
    printing: !p.printIncluded && p.model !== "finish",
    finish: p.finishes?.[0]?.id ?? "",
  };
}

export function PriceCalculator({
  productId,
  title,
  defaultOpen = false,
}: {
  productId: string;
  title?: string;
  defaultOpen?: boolean;
}) {
  const p = PRICING.products[productId] as PricedProduct | undefined;
  const t = useTranslations("pricer");
  const locale = useLocale();
  const ar = locale === "ar";

  const [open, setOpen] = useState(defaultOpen);
  const [st, setSt] = useState<State>(() => (p ? initialState(p) : ({} as State)));

  const money = useMemo(
    () => (n: number) => {
      const s = (Math.round(n * 100) / 100)
        .toFixed(2)
        .replace(/\.00$/, "")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return ar ? `${s} ج.م` : `EGP ${s}`;
    },
    [ar],
  );

  if (!p) return null;

  const v = p.variants[st.variant];
  const printCost = p.printingPerVariant ? (v.printing ?? 0) : (p.printing ?? 0);

  const unit = (() => {
    if (p.model === "perKg") {
      return (v.perKg ?? 0) / (v.pcsPerKg ?? 1) + (st.printing ? (p.printing ?? 0) : 0);
    }
    if (p.model === "finish") {
      return (v.prices as Record<string, number>)[st.finish] ?? 0;
    }
    const base = (v.prices as number[])[tierIndex(p.tiers!, st.qty)];
    return base + (st.printing ? printCost : 0);
  })();

  const moq =
    p.model === "finish" ? (v.moq ?? 1) : p.model === "perKg" ? 1 : (p.tiers?.[0] ?? 1);
  const belowMoq = st.qty < moq;

  const cheapest = Math.min(
    ...p.variants.map((vv, i) => {
      const s = { ...st, variant: i, qty: 1e9, printing: false };
      if (p.model === "perKg") return (vv.perKg ?? 0) / (vv.pcsPerKg ?? 1);
      if (p.model === "finish") return (vv.prices as Record<string, number>)[s.finish] ?? 0;
      return (vv.prices as number[])[(p.tiers!.length ?? 1) - 1];
    }),
  );

  const step = Math.max(Math.round((p.tiers?.[0] ?? 50) / 10), 1) * 10;
  const set = (patch: Partial<State>) => setSt((s) => ({ ...s, ...patch }));

  const send = () => {
    const L = ar
      ? { head: "طلب سعر من الموقع", item: "المنتج", size: "المقاس", fin: "التشطيب",
          pr: "الطباعة", qty: "الكمية", unit: "سعر القطعة", tot: "الإجمالي التقديري",
          yes: "نعم", no: "بدون" }
      : { head: "Price request from the website", item: "Product", size: "Size",
          fin: "Finishing", pr: "Printing", qty: "Quantity", unit: "Unit price",
          tot: "Estimated total", yes: "yes", no: "none" };

    const lines = [`*${L.head}*`, ""];
    if (title) lines.push(`${L.item}: ${title}`);
    lines.push(
      `${L.size}: ${v.size}${v.colour ? ` — ${ar ? v.colourAr : v.colour}` : ""}`,
    );
    if (p.model === "finish") {
      const f = p.finishes?.find((x) => x.id === st.finish);
      if (f) lines.push(`${L.fin}: ${ar ? f.ar : f.en}`);
    } else if (!p.printIncluded) {
      lines.push(`${L.pr}: ${st.printing ? L.yes : L.no}`);
    }
    lines.push(`${L.qty}: ${st.qty.toLocaleString("en-US")}`);
    lines.push(`${L.unit}: ${money(unit)}`);
    lines.push(`${L.tot}: ${money(unit * st.qty)}`);
    window.open(waLink(lines.join("\n")), "_blank", "noopener");
  };

  const num = (n: number) => n.toLocaleString("en-US");

  return (
    <div className="mt-4 border-t border-dashed border-line pt-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-accent/20 bg-accent-soft px-4 py-2.5 text-[0.9rem] font-bold text-accent-2 transition hover:border-accent/45 hover:bg-accent-soft/70"
      >
        <span>{t("open")}</span>
        <span className="flex items-center gap-1 whitespace-nowrap font-extrabold text-ink">
          {t("from")} {money(cheapest)}
          <span className="text-[0.8em] font-semibold text-muted">{t("each")}</span>
          <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
        </span>
      </button>

      {open && (
        <div className="pt-4">
          {/* size / variant */}
          <Field label={t("size")}>
            {p.variants.map((vv, i) => {
              const sub = [
                vv.sizeLabel ? (ar ? vv.sizeLabelAr : vv.sizeLabel) : null,
                vv.label ? (ar ? vv.labelAr : vv.label) : null,
                vv.colour ? (ar ? vv.colourAr : vv.colour) : null,
              ]
                .filter(Boolean)
                .join(" · ");
              return (
                <Opt key={`${vv.size}-${i}`} on={st.variant === i} onClick={() => set({ variant: i })}>
                  {vv.size}
                  {sub && <small className="block text-[0.74em] font-medium opacity-65">{sub}</small>}
                </Opt>
              );
            })}
          </Field>

          {/* finishing (only when there is a real choice) */}
          {p.model === "finish" && (p.finishes?.length ?? 0) > 1 && (
            <Field label={t("finish")}>
              {p.finishes!.map((f) => (
                <Opt key={f.id} on={st.finish === f.id} onClick={() => set({ finish: f.id })}>
                  {ar ? f.ar : f.en}
                </Opt>
              ))}
            </Field>
          )}

          {/* quantity-break strip */}
          {p.model === "tiers" && (
            <div className="mb-4 flex overflow-hidden rounded-lg border border-line">
              {p.tiers!.map((q, i) => {
                const cell = (v.prices as number[])[i] + (st.printing ? printCost : 0);
                const on = tierIndex(p.tiers!, st.qty) === i;
                const label =
                  i === p.tiers!.length - 1
                    ? `${num(q)}+`
                    : `${num(q)}–${num(p.tiers![i + 1] - 1)}`;
                return (
                  <div
                    key={q}
                    className={cn(
                      "flex-1 border-e border-line px-2 py-2.5 text-center last:border-e-0 transition-colors",
                      on ? "bg-ink" : "bg-paper",
                    )}
                  >
                    <span className={cn("block text-[0.74rem] font-semibold whitespace-nowrap", on ? "text-paper/70" : "text-muted")}>
                      {label}
                    </span>
                    <span className={cn("mt-0.5 block font-extrabold", on ? "text-paper" : "text-ink")}>
                      {money(cell)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {p.model === "perKg" && (
            <div className="mb-4 rounded-lg border border-line bg-ink px-3 py-2.5 text-center">
              <span className="block text-[0.74rem] font-semibold text-paper/70">
                {t("perkg", { price: money(v.perKg ?? 0), n: v.pcsPerKg ?? 0 })}
              </span>
              <span className="mt-0.5 block font-extrabold text-paper">{money(unit)}</span>
            </div>
          )}

          {/* printing */}
          {p.printIncluded ? (
            <p className="mb-4 flex items-center gap-2 text-[0.88rem] font-semibold">
              <Check className="size-4 text-leaf" />
              {t("included")}
            </p>
          ) : (
            p.model !== "finish" && (
              <label className="mb-4 flex cursor-pointer items-center gap-2.5 text-[0.88rem] font-semibold">
                <Checkbox
                  checked={st.printing}
                  onCheckedChange={(c) => set({ printing: c === true })}
                />
                <span>
                  {t("printing")}{" "}
                  <span className="font-bold text-accent-2">+{money(printCost)}</span>
                </span>
              </label>
            )
          )}

          {/* quantity */}
          <Field label={t("qty")}>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-9 rounded-lg"
                onClick={() => set({ qty: Math.max(1, st.qty - step) })}
                aria-label="-"
              >
                <Minus className="size-4" />
              </Button>
              <input
                type="number"
                value={st.qty}
                min={moq}
                onChange={(e) => set({ qty: Math.max(1, parseInt(e.target.value || "0", 10) || 0) })}
                className="h-9 w-28 rounded-lg border border-line bg-paper text-center font-bold outline-none focus:border-accent focus:ring-3 focus:ring-accent/12"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-9 rounded-lg"
                onClick={() => set({ qty: st.qty + step })}
                aria-label="+"
              >
                <Plus className="size-4" />
              </Button>
              <span className="text-[0.85rem] font-semibold text-muted">{t("pieces")}</span>
            </div>
          </Field>

          {/* output */}
          <div className="mb-3 flex flex-wrap items-end gap-6 rounded-lg border border-line bg-paper-2 px-4 py-3">
            <div className="grid gap-0.5">
              <span className="text-[0.74rem] font-bold uppercase tracking-wider text-muted">
                {t("unit")}
              </span>
              <span className="text-[1.05rem] font-extrabold">{money(unit)}</span>
            </div>
            <div className="grid gap-0.5">
              <span className="text-[0.74rem] font-bold uppercase tracking-wider text-muted">
                {t("total")}
              </span>
              <span className="text-[1.35rem] font-extrabold text-accent-2">
                {money(unit * st.qty)}
              </span>
            </div>
          </div>

          <p className={cn("text-[0.8rem] text-muted", belowMoq && "font-semibold text-accent-2")}>
            {belowMoq ? t("below", { n: num(moq) }) : t("moq", { n: num(moq) })}
          </p>

          <Button onClick={send} className="mt-4 w-full rounded-full bg-accent hover:bg-accent-2">
            <WhatsAppIcon className="size-4" />
            {t("send")}
          </Button>

          <p className="mt-3 text-[0.78rem] leading-relaxed text-muted">
            {ar ? p.moqNoteAr : p.moqNote}
            {(ar ? p.moqNoteAr : p.moqNote) && <br />}
            {t("novat")}
          </p>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <span className="mb-2 block text-[0.78rem] font-bold uppercase tracking-wider text-muted">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Opt({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-1.5 text-[0.85rem] font-semibold leading-tight transition-all",
        on
          ? "border-ink bg-ink text-paper"
          : "border-line bg-paper hover:border-ink-2",
      )}
    >
      {children}
    </button>
  );
}
