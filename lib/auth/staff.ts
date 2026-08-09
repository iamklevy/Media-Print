import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import {
  STAFF_SESSION_COOKIE,
  STAFF_SESSION_TTL_MS,
  isStaffSessionValid,
  sessionSecret,
  signPayload,
  type StaffSessionPayload,
} from "./session";

/** Verifies a PIN against the scrypt hash stored in STAFF_PIN_HASH ("salt:hash", both hex). */
export function verifyStaffPin(pin: string): boolean {
  const stored = process.env.STAFF_PIN_HASH;
  if (!stored) throw new Error("STAFF_PIN_HASH is not set.");
  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) throw new Error("STAFF_PIN_HASH is malformed, expected 'salt:hash'.");

  const expected = Buffer.from(hashHex, "hex");
  const actual = crypto.scryptSync(pin, salt, expected.length);
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

export async function createStaffSession(): Promise<void> {
  const payload: StaffSessionPayload = { role: "staff", exp: Date.now() + STAFF_SESSION_TTL_MS };
  const token = signPayload(payload, sessionSecret());
  const store = await cookies();
  store.set(STAFF_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: STAFF_SESSION_TTL_MS / 1000,
  });
}

export async function destroyStaffSession(): Promise<void> {
  const store = await cookies();
  store.delete(STAFF_SESSION_COOKIE);
}

/** True if the current request carries a valid, unexpired staff session cookie. */
export async function hasStaffSession(): Promise<boolean> {
  const store = await cookies();
  return isStaffSessionValid(store.get(STAFF_SESSION_COOKIE)?.value);
}

/** Throws if there is no valid staff session. Call at the top of every staff Server Action. */
export async function requireStaffSession(): Promise<void> {
  if (!(await hasStaffSession())) {
    throw new Error("Not authenticated.");
  }
}
