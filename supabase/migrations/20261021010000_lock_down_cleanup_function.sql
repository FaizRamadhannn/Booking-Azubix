-- delete_expired_bookings() is SECURITY DEFINER. `revoke ... from public` in
-- earlier migrations does not remove Supabase's default EXECUTE grants to anon
-- and authenticated, so anyone holding the public anon key could call it via
-- PostgREST. Only pg_cron (postgres) and the server (service_role) need it.

revoke all on function public.delete_expired_bookings(timestamptz) from public, anon, authenticated;
grant execute on function public.delete_expired_bookings(timestamptz) to service_role;
