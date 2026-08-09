import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { STAFF_SESSION_COOKIE, isStaffSessionValid } from "./lib/auth/session";

// Next 16 renamed the `middleware` convention to `proxy`; behaviour is identical.
const intl = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  // /ops is a top-level, non-localized route (its own app/ops/layout.tsx),
  // so it must never reach next-intl's locale middleware below — that would
  // try to redirect it into a non-existent /ar/ops and 404.
  if (request.nextUrl.pathname.startsWith("/ops")) {
    if (request.nextUrl.pathname === "/ops/login") return NextResponse.next();

    const cookie = request.cookies.get(STAFF_SESSION_COOKIE)?.value;
    if (!isStaffSessionValid(cookie)) {
      return NextResponse.redirect(new URL("/ops/login", request.url));
    }
    return NextResponse.next();
  }

  return intl(request);
}

export const config = {
  /**
   * Run on everything except API routes, Next internals and static files.
   * NOTE the double backslash: in a JS string "\." collapses to ".", which
   * turns the "has a file extension" exclusion into "has any character" and
   * silently stops the proxy running on every real page.
   */
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
