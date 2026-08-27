import "server-only";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Cookie-bound Supabase client, anon key only — used exclusively for
 * `.auth.*` calls (sign in, sign out, session checks). All `orders` /
 * `order_events` / storage access keeps going through the service-role
 * client in `./server.ts`; this one never touches the database.
 */
export async function createAuthServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL / SUPABASE_ANON_KEY are not set. Copy .env.example to .env.local and fill them in.");
  }

  const store = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a Server Component render — cookies() is read-only
          // there. proxy.ts's own session refresh (and any Server Action)
          // is what actually persists a refreshed token; this is a no-op.
        }
      },
    },
  });
}
