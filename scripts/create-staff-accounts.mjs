// One-off / reusable setup script: creates (or re-invites) a Supabase Auth
// account for each staff member below and emails them a link to set their
// own password. Nobody — including whoever runs this — ever sees or
// transmits the actual password.
//
// Run with:
//   node --env-file=.env.local scripts/create-staff-accounts.mjs
//
// Safe to re-run: if an account already exists for an email, it's left
// alone and just gets a fresh password-setup link (handy for adding a new
// hire later, or resending a link that expired).

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const STAFF = [
  { email: "mediaprint.egypt@gmail.com", name: "Mohamed" },
  { email: "hamodyosama50@gmail.com", name: "Ahmed" },
];

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM ?? "Media Print <orders@mediaprint-eg.com>";
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set — check .env.local.");
}
if (!RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set — check .env.local.");
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const resend = new Resend(RESEND_API_KEY);

function passwordSetupEmailHtml(actionLink) {
  return `<!doctype html>
<html lang="en" dir="ltr">
  <body style="margin:0;padding:0;background:#f4f2ee;font-family:Tahoma,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2ee;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:480px;background:#ffffff;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="background:#1a1a1a;padding:20px 28px;">
                <span style="color:#ffffff;font-size:18px;font-weight:700;">Media Print Pack</span>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;color:#1a1a1a;font-size:15px;line-height:1.6;">
                <p>You've been given access to the Media Print Pack operations board.</p>
                <p>Set your password to sign in — this link works once and expires shortly:</p>
                <p style="margin:24px 0;"><a href="${actionLink}" style="display:inline-block;background:#c4432c;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:999px;">Set your password</a></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function ensureAccount(email, name) {
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { display_name: name },
  });

  if (createError && !`${createError.message}`.toLowerCase().includes("already been registered")) {
    throw createError;
  }
  if (created?.user) {
    console.log(`Created account for ${name} <${email}>`);
  } else {
    console.log(`Account for ${name} <${email}> already exists — sending a fresh password-setup link.`);
  }

  const { data: link, error: linkError } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: `${SITE_URL}/ops/reset-password` },
  });
  if (linkError || !link?.properties?.hashed_token) {
    throw linkError ?? new Error("generateLink returned no hashed_token");
  }

  // Link to our own page with just the token_hash, NOT Supabase's action_link
  // (which points straight at the GET-based /auth/v1/verify endpoint).
  // Email link-scanners (Gmail, Outlook Safe Links, etc.) auto-visit any
  // link in the message to check it's safe, and a GET there redeems the
  // one-time token before the real person ever clicks — they'd land on
  // "otp_expired". Our page only redeems it when the reset form is
  // submitted (a Server Action, not a plain followable link).
  const resetLink = `${SITE_URL}/ops/reset-password?token_hash=${link.properties.hashed_token}&type=recovery`;

  const { error: sendError } = await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: "Set your password — Media Print Pack Operations",
    html: passwordSetupEmailHtml(resetLink),
  });
  if (sendError) throw sendError;

  console.log(`Password-setup email sent to ${email}`);
}

for (const { email, name } of STAFF) {
  await ensureAccount(email, name);
}
