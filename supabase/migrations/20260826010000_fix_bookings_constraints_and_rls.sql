-- Migration: fix the bookings table if the first version was already applied
--
-- Run this ONLY if you already created public.bookings from the original
-- migration (the one with `CONSTRAINT unique_booking_date_slot` and the public
-- INSERT policy). On a fresh database the create migration alone is enough.
--
-- Existing rows are preserved.
--
-- The whole migration runs in ONE transaction. The old schema had no value
-- constraints, so existing rows may violate the new ones. If any step fails,
-- nothing is applied at all: fix the offending rows and re-run. You are never
-- left half-migrated, and never left without duplicate protection.

begin;

-- 1. Close the hole first.
--
-- The anon key is public, so this policy let anyone write arbitrary rows
-- straight to PostgREST, bypassing every server-side rule. The application
-- never used it: the server writes with the service role key, which ignores RLS.
drop policy if exists "Allow public booking insertion" on public.bookings;

-- Make sure RLS is on. With no policies, anon and authenticated can do nothing.
alter table public.bookings enable row level security;

-- 2. Add the columns the cancel / expiry features need.
alter table public.bookings
  add column if not exists status text not null default 'BOOKED';

alter table public.bookings
  add column if not exists updated_at timestamptz not null default now();

-- 3. Replace the table constraint with a PARTIAL unique index.
--
-- `CONSTRAINT ... UNIQUE` cannot carry a WHERE clause, so a cancelled booking
-- would keep reserving its slot forever. Dropping it and creating a partial
-- index is what lets a cancellation actually free the hour.
create unique index if not exists bookings_slot_unique
  on public.bookings (date, slot)
  where status <> 'CANCELLED';

alter table public.bookings
  drop constraint if exists unique_booking_date_slot;

create index if not exists idx_bookings_status on public.bookings (status);

-- 4. Add the value constraints.
--
-- Separate statements so a failure names exactly which rule existing data
-- violates. Run the preflight query in the README before applying this.
alter table public.bookings
  drop constraint if exists bookings_status_check,
  add constraint bookings_status_check
    check (status in ('BOOKED', 'EXPIRED', 'CANCELLED'));

alter table public.bookings
  drop constraint if exists bookings_level_check,
  add constraint bookings_level_check
    check (level in ('A1', 'A2', 'B1'));

alter table public.bookings
  drop constraint if exists bookings_date_check,
  add constraint bookings_date_check
    check (date ~ '^\d{4}-\d{2}-\d{2}$');

alter table public.bookings
  drop constraint if exists bookings_slot_check,
  add constraint bookings_slot_check
    check (
      slot in (
        '10:00-11:30', '12:00-13:30', '13:30-15:00',
        '15:00-16:30', '16:30-18:00', '18:00-19:30'
      )
    );

alter table public.bookings
  drop constraint if exists bookings_student_name_check,
  add constraint bookings_student_name_check
    check (length(btrim(student_name)) between 2 and 80);

alter table public.bookings
  drop constraint if exists bookings_whatsapp_group_check,
  add constraint bookings_whatsapp_group_check
    check (length(btrim(whatsapp_group)) between 2 and 80);

alter table public.bookings
  drop constraint if exists bookings_last_material_check,
  add constraint bookings_last_material_check
    check (length(btrim(last_material)) between 2 and 200);

commit;
