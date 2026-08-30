-- Migration: create the bookings table
--
-- Mirrors the SQLite schema in src/lib/booking/repository.ts. Every business
-- rule lives in src/lib/booking/constants.ts; the constraints below are
-- defence in depth, not the primary enforcement.

create table if not exists public.bookings (
  id             uuid primary key default gen_random_uuid(),

  -- A1, A2 and B1 are the only levels that exist. B2 must never be storable.
  level          text not null check (level in ('A1', 'A2', 'B1')),

  -- ISO date in Asia/Jakarta, e.g. '2026-08-31'. Kept as text so it compares
  -- and sorts lexicographically, exactly as the application code expects.
  date           text not null check (date ~ '^\d{4}-\d{2}-\d{2}$'),

  -- Students can never invent a slot: only the six published ones are storable.
  slot           text not null check (
                   slot in (
                     '10:00-11:30', '12:00-13:30', '13:30-15:00',
                     '15:00-16:30', '16:30-18:00', '18:00-19:30'
                   )
                 ),

  -- BOOKED on creation; EXPIRED once the class has finished; CANCELLED when an
  -- admin cancels it, which is the only status that releases the slot.
  status         text not null default 'BOOKED'
                   check (status in ('BOOKED', 'EXPIRED', 'CANCELLED')),

  student_name   text not null check (length(btrim(student_name)) between 2 and 80),
  whatsapp_group text not null check (length(btrim(whatsapp_group)) between 2 and 80),
  last_material  text not null check (length(btrim(last_material)) between 2 and 200),

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Duplicate protection.
--
-- One slot on one date holds exactly one class, whatever the level. This is a
-- PARTIAL unique index rather than a table constraint, because a cancelled
-- booking must keep its history while releasing its hour for someone else.
-- Postgres cannot express that with `CONSTRAINT ... UNIQUE`.
--
-- This index is what makes concurrent bookings safe: if two requests race, the
-- second write fails and the application returns SLOT_TAKEN (HTTP 409).
create unique index if not exists bookings_slot_unique
  on public.bookings (date, slot)
  where status <> 'CANCELLED';

-- Availability lookups always filter by date.
create index if not exists idx_bookings_date on public.bookings (date);

-- Admin listing filters by status, and expiry sweeps scan for BOOKED rows.
create index if not exists idx_bookings_status on public.bookings (status);

-- Row Level Security
--
-- RLS is enabled with NO policies, which is deliberate: it denies the anon and
-- authenticated roles everything. All access goes through the Next.js server
-- using SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS.
--
-- Do NOT add an anon INSERT policy. The anon key ships to the browser, so any
-- such policy lets people write straight to this table via PostgREST, skipping
-- every server-side rule: weekday checks, past-date checks, level validation
-- and field validation. The booking flow does not need it — the browser talks
-- to /api/bookings, never to Supabase.
alter table public.bookings enable row level security;

comment on table public.bookings is
  'German class bookings. Written only by the application server via the service role key; RLS denies all direct client access.';
