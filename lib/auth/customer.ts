import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import {
  CUSTOMER_SESSION_TTL_MS,
  customerCookieName,
  sessionSecret,
  signPayload,
  verifyPayload,
  type CustomerSessionPayload,
} from "./session";

/** Constant-time comparison of the phone's last 4 digits against user input. */
export function lastFourMatches(phone: string, input: string): boolean {
  const actual = phone.replace(/\D/g, "").slice(-4);
  const given = input.replace(/\D/g, "").slice(-4);
  if (actual.length !== 4 || given.length !== 4) return false;
  return crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(given));
}

export async function createCustomerSession(slug: string): Promise<void> {
  const payload: CustomerSessionPayload = {
    role: "customer",
    slug,
    exp: Date.now() + CUSTOMER_SESSION_TTL_MS,
  };
  const token = signPayload(payload, sessionSecret());
  const store = await cookies();
  store.set(customerCookieName(slug), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CUSTOMER_SESSION_TTL_MS / 1000,
  });
}

/** True if the current request carries a valid session for this exact order's slug. */
export async function hasCustomerSession(slug: string): Promise<boolean> {
  const store = await cookies();
  const raw = store.get(customerCookieName(slug))?.value;
  const payload = verifyPayload<CustomerSessionPayload>(raw, sessionSecret());
  return !!payload && payload.role === "customer" && payload.slug === slug && payload.exp > Date.now();
}

/** Throws if there is no valid session for this slug. Call at the top of customer Server Actions. */
export async function requireCustomerSession(slug: string): Promise<void> {
  if (!(await hasCustomerSession(slug))) {
    throw new Error("Not verified for this order.");
  }
}
