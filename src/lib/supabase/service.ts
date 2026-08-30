import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { supabaseServiceRoleKey, supabaseUrl } from "./env";

let client: SupabaseClient | null = null;

/**
 * Service-role client for all data access. It bypasses RLS, which is why the
 * database has no policies at all: this server is the only thing that may
 * touch `bookings`, and every business rule is enforced before it gets here.
 *
 * Never import this from a Client Component.
 */
export function supabaseService(): SupabaseClient {
  if (client) return client;

  client = createClient(supabaseUrl(), supabaseServiceRoleKey(), {
    auth: {
      // A service client has no user session to persist or refresh.
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return client;
}
