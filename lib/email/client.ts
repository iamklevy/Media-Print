import "server-only";
import { Resend } from "resend";

// Sender identity for every transactional email — the mailbox this address
// sends from must be a verified domain in the Resend dashboard.
export const EMAIL_FROM = process.env.EMAIL_FROM ?? "Media Print <orders@mediaprint-eg.com>";

let client: Resend | null = null;

/** Lazy singleton so a missing RESEND_API_KEY only breaks email sending, not the whole module graph. */
function resend(): Resend {
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

/**
 * Fire-and-forget email send: logs and swallows failures instead of
 * throwing, so a Resend outage or bad address never breaks the order
 * action (quote submission, phase advance, gate response) it's attached to.
 */
export async function sendEmail(opts: { to: string; subject: string; html: string }): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping email:", opts.subject, "->", opts.to);
    return;
  }
  try {
    const { error } = await resend().emails.send({ from: EMAIL_FROM, ...opts });
    if (error) console.error("sendEmail failed", opts.subject, "->", opts.to, error);
  } catch (err) {
    console.error("sendEmail threw", opts.subject, "->", opts.to, err);
  }
}
