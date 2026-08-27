import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next 16 renamed the `middleware` convention to `proxy`; behaviour is identical.
const intl = createMiddleware(routing);

// These stay reachable without a session — the login flow itself, and the
// forgot/reset-password round trip.
const OPS_PUBLIC_PATHS = ["/ops/login", "/ops/forgot-password", "/ops/reset-password"];

export default async function proxy(request: NextRequest) {
  // /ops is a top-level, non-localized route (its own app/ops/layout.tsx),
  // so it must never reach next-intl's locale middleware below — that would
  // try to redirect it into a non-existent /ar/ops and 404.
  if (request.nextUrl.pathname.startsWith("/ops")) {
    if (OPS_PUBLIC_PATHS.includes(request.nextUrl.pathname)) return NextResponse.next();

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error("SUPABASE_URL / SUPABASE_ANON_KEY are not set. Copy .env.example to .env.local and fill them in.");
    }

    let response = NextResponse.next({ request });

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (
          cookiesToSet: { name: string; value: string; options: CookieOptions }[],
          headers: Record<string, string>
        ) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    });

    // getUser() (not getSession()) revalidates the token against Supabase
    // rather than trusting a locally-decoded cookie — this is only an
    // optimistic check anyway; every staff Server Action independently
    // re-verifies via requireStaffSession() since Server Functions aren't
    // guaranteed to be covered by this proxy's matcher.
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.redirect(new URL("/ops/login", request.url));
    }
    return response;
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
