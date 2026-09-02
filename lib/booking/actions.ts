"use server";

import { notifyBookingRequest } from "@/lib/email/notify";

const MODE_LABEL: Record<string, string> = {
  online: "Online meeting (video / WhatsApp call)",
  yours: "At the customer's office — our rep visits",
  ours: "At our office — 323 Sudan St, Mohandessin, Giza",
};

export async function submitBookingRequest(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const get = (k: string) => (formData.get(k) as string | null)?.trim() ?? "";

  const name = get("name");
  const phone = get("phone");
  const date = get("date");
  const time = get("time");
  if (!name || !phone || !date || !time) return { ok: false, error: "Missing required fields." };

  const mode = get("mode");

  await notifyBookingRequest({
    where: MODE_LABEL[mode] ?? mode,
    name,
    company: get("company") || null,
    phone,
    date,
    time,
    topic: get("topic") || null,
    notes: get("notes") || null,
  });

  return { ok: true };
}
