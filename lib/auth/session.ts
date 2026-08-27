import "server-only";
import crypto from "node:crypto";

/**
 * Pure HMAC sign/verify for session cookies, with no Next.js-specific
 * imports (no `next/headers`) so it can be safely imported from proxy.ts
 * as well as from Server Actions / Route Handlers / Server Components.
 */

export function signPayload(payload: object, secret: string): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyPayload<T>(token: string | undefined | null, secret: string): T | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot < 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expected = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

export function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set.");
  return secret;
}

export const CUSTOMER_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface CustomerSessionPayload {
  role: "customer";
  slug: string;
  exp: number;
}

export function customerCookieName(slug: string): string {
  return `mp_track_${slug}`;
}
