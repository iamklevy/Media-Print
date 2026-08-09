"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { ImageIcon } from "lucide-react";

import { STICKERS } from "@/content/stickers";
import { cn } from "@/lib/utils";

export function StickerCatalogue() {
  const t = useTranslations();
  const locale = useLocale();
  const ar = locale === "ar";
  const [cat, setCat] = useState("all");

  const money = (n: number) => {
    const s = (Math.round(n * 100) / 100).toFixed(2).replace(/\.00$/, "");
    return ar ? `${s} ج.م` : `EGP ${s}`;
  };

  const matName = (id: string) => {
    const m = STICKERS.materials.find((x) => x.id === id);
    return m ? (ar ? m.ar : m.en) : id;
  };

  const items =
    cat === "all" ? STICKERS.items : STICKERS.items.filter((i) => i.cat === cat);

  return (
    <>
      <span className="mb-3 block text-[0.78rem] font-bold uppercase tracking-wider text-muted">
        {t("stick.browse")}
      </span>
      <div className="mb-8 flex flex-wrap gap-2">
        <Cat on={cat === "all"} onClick={() => setCat("all")}>
          {t("stick.all")}
        </Cat>
        {STICKERS.categories.map((c) => (
          <Cat key={c.id} on={cat === c.id} onClick={() => setCat(c.id)}>
            {ar ? c.ar : c.en}
          </Cat>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <article
            key={it.id}
            className="group flex flex-col overflow-hidden rounded-card border border-line bg-paper transition-all hover:-translate-y-1 hover:border-transparent hover:shadow-lift"
          >
            <div className="relative grid aspect-square place-items-center overflow-hidden bg-paper-2">
              {it.img ? (
                <Image src={it.img} alt="" fill sizes="25vw" className="object-cover" />
              ) : (
                <ImageIcon className="size-11 text-line" strokeWidth={1.4} />
              )}
              <span className="absolute start-2.5 top-2.5 rounded-full bg-ink/80 px-2.5 py-1 text-[0.7rem] font-bold text-paper backdrop-blur-sm">
                {matName(it.mat)}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-1 px-4 pb-5 pt-4">
              <h3 className="text-[1rem] leading-snug">{ar ? it.ar : it.en}</h3>
              <span className="text-[0.84rem] font-semibold text-muted">
                {t("stick.size")}: {it.size} cm
              </span>
              {it.moq && (
                <span className="text-[0.84rem] font-semibold text-muted">
                  {t("stick.moq")} {it.moq}
                </span>
              )}
              <span className="mt-auto pt-2">
                {it.price == null ? (
                  <span className="text-[0.9rem] font-bold text-accent-2">
                    {t("stick.ask")}
                  </span>
                ) : (
                  <span className="text-[1.05rem] font-extrabold">
                    <small className="text-[0.72em] font-semibold text-muted">
                      {t("stick.from")}{" "}
                    </small>
                    {money(it.price)}
                    <small className="text-[0.72em] font-semibold text-muted">
                      {" "}
                      {t("stick.each")}
                    </small>
                  </span>
                )}
              </span>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

export function StickerOffers() {
  const t = useTranslations();
  const locale = useLocale();
  const ar = locale === "ar";

  if (STICKERS.offers.length === 0) {
    return (
      <div className="rounded-card border-[1.5px] border-dashed border-line px-8 py-12 text-center text-[0.95rem] text-muted">
        {t("stick.offersEmpty")}
      </div>
    );
  }

  const money = (n: number) => {
    const s = (Math.round(n * 100) / 100).toFixed(2).replace(/\.00$/, "");
    return ar ? `${s} ج.م` : `EGP ${s}`;
  };

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {STICKERS.offers.map((o) => {
        const it = STICKERS.items.find((x) => x.id === o.item);
        if (!it) return null;
        const save = o.was && o.was > o.price ? o.was - o.price : 0;
        return (
          <div
            key={o.item}
            className="relative grid gap-1.5 rounded-card border border-line bg-paper px-5 py-5"
          >
            {save > 0 && (
              <span className="absolute -top-2.5 end-3.5 rounded-full bg-leaf px-3 py-1 text-[0.74rem] font-extrabold text-white">
                {ar ? "وفّر" : "Save"} {money(save)}
              </span>
            )}
            <h3 className="text-[1.05rem]">{ar ? it.ar : it.en}</h3>
            <span className="text-[0.82rem] font-bold text-muted">
              {o.qty.toLocaleString("en-US")} {ar ? "استيكر" : "stickers"}
            </span>
            <span className="text-[1.5rem] font-extrabold tracking-tight text-accent-2">
              {money(o.price)}
            </span>
            {save > 0 && (
              <span className="text-[0.9rem] text-muted line-through">{money(o.was!)}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Cat({
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
        "rounded-full border px-4 py-2 text-[0.92rem] font-semibold transition-all",
        on ? "border-ink bg-ink text-paper" : "border-line bg-transparent hover:border-ink",
      )}
    >
      {children}
    </button>
  );
}
