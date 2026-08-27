import "server-only";

import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { supabaseServer } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/client";
import { staffSetPasswordEmail } from "@/lib/email/templates";

export interface StaffIdentity {
  email: string;
  name: string;
}

/** The currently signed-in staff member, or null. `name` is the display name set at account creation, falling back to the email. */
export async function getStaffUser(): Promise<StaffIdentity | null> {
  const supabase = await createAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;
  return { email: user.email, name: (user.user_metadata?.display_name as string | undefined) || user.email };
}

/** True if the current request carries a valid Supabase Auth session. */
export async function hasStaffSession(): Promise<boolean> {
  return !!(await getStaffUser());
}

/** Throws if there is no valid staff session. Call at the top of every staff Server Action. */
export async function requireStaffSession(): Promise<StaffIdentity> {
  const staff = await getStaffUser();
  if (!staff) throw new Error("Not authenticated.");
  return staff;
}

export async function staffSignIn(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createAuthServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: "Incorrect email or password." };
  return { ok: true };
}

export async function staffSignOut(): Promise<void> {
  const supabase = await createAuthServerClient();
  await supabase.auth.signOut();
}

function resetRedirectUrl(): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${site.replace(/\/$/, "")}/ops/reset-password`;
}

/**
 * Generates a Supabase recovery link and emails it via the app's own Resend
 * sender (not Supabase's built-in email service, so it matches the rest of
 * the product's branding and isn't subject to Supabase's shared send-rate
 * limits). Used both by "forgot password" and by the one-off account-setup
 * script. Swallows errors — never reveals whether an email has an account.
 *
 * The email links to our own /ops/reset-password page carrying just the
 * `token_hash`, rather than Supabase's `action_link` (which points straight
 * at Supabase's GET-based /auth/v1/verify endpoint). Gmail/Outlook-style
 * link-scanners auto-visit any link in an email to check it's safe, and a
 * GET to that endpoint redeems the one-time token — so the real user gets
 * "otp_expired" the moment they click. Our own page only redeems the token
 * when the reset form is actually submitted (a Server Action, not a plain
 * link a scanner could follow).
 */
export async function sendStaffPasswordSetupLink(email: string): Promise<void> {
  try {
    const db = supabaseServer();
    const { data, error } = await db.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo: resetRedirectUrl() },
    });
    if (error || !data?.properties?.hashed_token) return;

    const link = `${resetRedirectUrl()}?token_hash=${data.properties.hashed_token}&type=recovery`;
    const template = staffSetPasswordEmail(link);
    await sendEmail({ to: email, ...template });
  } catch (err) {
    console.error("sendStaffPasswordSetupLink failed", err);
  }
}
