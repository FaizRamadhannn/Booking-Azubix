"use server";

import { revalidatePath } from "next/cache";

import { createAuthClient } from "@/lib/supabase/server";
import { supabaseService } from "@/lib/supabase/service";

export type AdminSignInErrorCode = "MISSING_FIELDS" | "INVALID_CREDENTIALS" | "NOT_ADMIN";

export interface AdminSignInState {
  /** A code, not display text — the client maps it to a localized message. */
  error: AdminSignInErrorCode | null;
}

/**
 * Signs an admin in with email and password.
 *
 * A correct password is not enough: the account must also be on the
 * `admin_users` allowlist. If it is not, the session is torn down again so a
 * non-admin account cannot linger in a signed-in state.
 */
export async function signInAdmin(
  _previous: AdminSignInState,
  formData: FormData,
): Promise<AdminSignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "MISSING_FIELDS" };
  }

  const auth = await createAuthClient();
  const { data, error } = await auth.auth.signInWithPassword({ email, password });

  // Deliberately vague: never reveal whether an address has an account.
  if (error || !data.user) {
    return { error: "INVALID_CREDENTIALS" };
  }

  const { data: allowed } = await supabaseService()
    .from("admin_users")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (!allowed) {
    await auth.auth.signOut();
    return { error: "NOT_ADMIN" };
  }

  revalidatePath("/admin/bookings");
  return { error: null };
}

export async function signOutAdmin(): Promise<void> {
  const auth = await createAuthClient();
  await auth.auth.signOut();
  revalidatePath("/admin/bookings");
}
