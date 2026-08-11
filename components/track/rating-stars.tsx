"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { submitRating } from "@/lib/orders/actions";
import type { Order } from "@/lib/orders/types";

function Stars({
  value,
  onChange,
  size = "size-7",
}: {
  value: number;
  onChange?: (n: number) => void;
  size?: string;
}) {
  const [hover, setHover] = useState(0);
  const interactive = !!onChange;
  const shown = hover || value;

  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => interactive && setHover(n)}
          className={cn(interactive && "cursor-pointer", !interactive && "cursor-default")}
          aria-label={`${n}`}
        >
          <Star
            className={cn(size, n <= shown ? "fill-amber text-amber" : "fill-transparent text-line")}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}

export function RatingStars({ order }: { order: Order }) {
  const t = useTranslations("track.delivered");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(order.rating != null);
  const [savedRating, setSavedRating] = useState(order.rating ?? 0);

  async function submit() {
    if (!rating) return;
    setSubmitting(true);
    const res = await submitRating(order.tracking_slug, rating, comment);
    setSubmitting(false);
    if (res.ok) {
      setSavedRating(rating);
      setDone(true);
    }
  }

  if (done) {
    return (
      <div className="grid gap-1.5 border-t border-line pt-4">
        <p className="text-sm font-semibold text-ink">{t("rate_thanks")}</p>
        <Stars value={savedRating} size="size-5" />
      </div>
    );
  }

  return (
    <div className="grid gap-2.5 border-t border-line pt-4">
      <p className="text-sm font-semibold text-ink">{t("rate_title")}</p>
      <p className="text-sm text-muted">{t("rate_prompt")}</p>
      <Stars value={rating} onChange={setRating} />
      {rating > 0 && (
        <>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("comment_placeholder")}
            rows={2}
          />
          <Button onClick={submit} disabled={submitting} className="w-fit bg-accent hover:bg-accent-2">
            {submitting ? t("rate_submitting") : t("rate_submit")}
          </Button>
        </>
      )}
    </div>
  );
}
