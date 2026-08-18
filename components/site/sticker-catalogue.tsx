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
            </div>
          </article>
        ))}
      </div>
    </>
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
