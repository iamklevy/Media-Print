import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Forces a browser download instead of an inline preview for images hosted
 * in our own Supabase Storage buckets (which support the `?download` query
 * param). URLs from anywhere else are returned unchanged — the `download`
 * attribute on the <a> is a best-effort fallback for those.
 */
export function downloadUrl(url: string, filename: string): string {
  if (!url.includes("/storage/v1/object/public/")) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}download=${encodeURIComponent(filename)}`;
}

const VIDEO_EXTS = new Set(["mp4", "mov", "webm"]);

function urlExt(url: string): string {
  const path = url.split("?")[0];
  const match = path.match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toLowerCase() : "";
}

/** Sample slots can hold either a photo or a short video clip — tell them apart by extension. */
export function isVideoUrl(url: string): boolean {
  return VIDEO_EXTS.has(urlExt(url));
}

/** Swaps a download filename's extension for the uploaded file's real one, so a video doesn't download with a `.jpg` name. */
export function withRealExt(filename: string, url: string): string {
  const ext = urlExt(url);
  if (!ext) return filename;
  return filename.replace(/\.[a-z0-9]+$/i, `.${ext}`);
}

/** "Today 4:29 PM" / "Yesterday 11:38 PM" / "10 Aug · 4:29 PM" — matches the reference tracking-timeline design. */
export function formatRelativeDay(
  date: Date,
  locale: string,
  labels: { today: string; yesterday: string }
): string {
  const now = new Date();
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOf(now) - startOf(date)) / 86_400_000);

  const time = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

  if (diffDays === 0) return `${labels.today} ${time}`;
  if (diffDays === 1) return `${labels.yesterday} ${time}`;
  const day = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", { day: "numeric", month: "short" }).format(
    date
  );
  return `${day} · ${time}`;
}
