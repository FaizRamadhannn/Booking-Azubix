import "server-only";

import { createAuthClient } from "@/lib/supabase/server";
import { supabaseService } from "@/lib/supabase/service";

/** The signed-in admin, as far as the UI needs to know. */
export interface AdminIdentity {
  id: string;
  email: string;
}

/**
 * Resolves the current admin, or `null`.
 *
 * Two independent checks, both of which must pass:
 *
 * 1. **Authentication** — `getUser()` revalidates the JWT against Supabase.
 *    (`getSession()` only reads the cookie and is not safe to trust here.)
 * 2. **Authorisation** — the user must be listed in `public.admin_users`.
 *
 * Holding a Supabase account is therefore not enough. That table is written
 * only by hand with the service role, so nobody can promote themselves.
 */
export async function getAdmin(): Promise<AdminIdentity | null> {
  const auth = await createAuthClient();
  const {
    data: { user },
  } = await auth.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabaseService()
    .from("admin_users")
    .select("user_id, email")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[auth] admin allowlist lookup failed", error);
    return null;
  }
  if (!data) return null;

  return { id: user.id, email: user.email ?? (data.email as string) };
}

/** True when the caller may see booking data. */
export async function isAdminAuthorized(): Promise<boolean> {
  return (await getAdmin()) !== null;
}
