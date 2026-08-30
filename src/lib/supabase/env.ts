import "server-only";

/**
 * Reads Supabase configuration, failing loudly at first use rather than letting
 * an undefined URL turn into a confusing runtime error deep in a query.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env.local and fill it in.`,
    );
  }
  return value;
}

export function supabaseUrl(): string {
  return required("NEXT_PUBLIC_SUPABASE_URL");
}

/** Safe to expose to the browser: it only grants what RLS allows. */
export function supabasePublishableKey(): string {
  return required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
}

/**
 * Bypasses RLS entirely. Must never reach the browser — it is read only from
 * server modules, and its name deliberately has no `NEXT_PUBLIC_` prefix.
 */
export function supabaseServiceRoleKey(): string {
  return required("SUPABASE_SERVICE_ROLE_KEY");
}
