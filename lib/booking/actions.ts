"use server";

import { notifyBookingRequest } from "@/lib/email/notify";

const MODE_LABEL: Record<string, string> = {
  online: "Online meeting (video / WhatsApp call)",
  yours: "At the customer's office — our rep visits",
  ours: "At our office — 323 Sudan St, Mohandessin, Giza",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitBookingRequest(
  formData: FormData,
  locale: string
): Promise<{ ok: boolean; error?: string }> {
  const get = (k: string) => (formData.get(k) as string | null)?.trim() ?? "";

  const name = get("name");
  const phone = get("phone");
  const email = get("email");
  const date = get("date");
  const time = get("time");
  if (!name || !phone || !email || !date || !time) return { ok: false, error: "Missing required fields." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Invalid email address." };

  const mode = get("mode");

  await notifyBookingRequest(
    {
      where: MODE_LABEL[mode] ?? mode,
      name,
      company: get("company") || null,
      phone,
      email,
      date,
      time,
      topic: get("topic") || null,
      notes: get("notes") || null,
    },
    { mode, locale: locale === "en" ? "en" : "ar" }
  );

  return { ok: true };
}
