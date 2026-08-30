import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { supabasePublishableKey, supabaseUrl } from "./env";

/**
 * Request-scoped client used **only for authentication** — reading the signed-in
 * user and running sign in / sign out. It carries the publishable key and is
 * subject to RLS, so it can never read booking data.
 *
 * Per the Supabase SSR contract, only `getAll` / `setAll` may be used for
 * cookies; the individual `get` / `set` / `remove` methods are not supported.
 */
export async function createAuthClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl(), supabasePublishableKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // Session refresh still happens in Server Actions and Route Handlers.
        }
      },
    },
  });
}
