-- Migration: admin allowlist
--
-- Having a Supabase Auth account does NOT make someone an admin. Authentication
-- answers "who are you"; this table answers "are you allowed in". Both must
-- pass before the dashboard shows any student data.
--
-- Keep public sign-ups disabled in Supabase (Authentication → Sign In / Up →
-- "Allow new users to sign up" = off). Create admins from the dashboard, then
-- add their id here.

create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);

-- Server-only, exactly like public.bookings: RLS on, no policies. The Next.js
-- server reads this with the service role key, which bypasses RLS.
--
-- This matters more here than anywhere else: if a signed-in user could write to
-- this table, they could promote themselves to admin.
alter table public.admin_users enable row level security;

revoke all on public.admin_users from anon, authenticated;

comment on table public.admin_users is
  'Allowlist of Supabase Auth users permitted to use /admin/bookings. Managed manually; never writable by the client.';

-- ---------------------------------------------------------------------------
-- After creating your admin user in Authentication → Users, run this once,
-- replacing the address with that user''s email:
--
--   insert into public.admin_users (user_id, email)
--   select id, email from auth.users where email = 'you@example.com'
--   on conflict (user_id) do nothing;
--
-- To check who currently has access:
--
--   select email, created_at from public.admin_users order by created_at;
--
-- To revoke someone:
--
--   delete from public.admin_users where email = 'them@example.com';
-- ---------------------------------------------------------------------------
