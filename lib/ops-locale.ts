import "server-only";
import { cookies } from "next/headers";

export type OpsLocale = "en" | "ar";

const COOKIE = "mp_ops_locale";

export async function getOpsLocale(): Promise<OpsLocale> {
  const store = await cookies();
  const value = store.get(COOKIE)?.value;
  return value === "ar" ? "ar" : "en";
}

export async function setOpsLocaleCookie(locale: OpsLocale): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, locale, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
