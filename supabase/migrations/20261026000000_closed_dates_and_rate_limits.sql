-- 1. Days the admin has closed (holiday, sick day, ...).
--
-- A weekday can only be closed while nobody has booked it. Any booking that
-- still holds a slot counts, including ones waiting for payment or for the
-- admin's confirmation; only CANCELLED rows are ignored.
--
-- Closing a day and booking a slot on it can happen at the same moment, so
-- both take the same per-date advisory lock. Whichever comes second sees the
-- other's result: either the booking is rejected (DATE_CLOSED) or the close
-- is (DATE_HAS_BOOKINGS).

create table if not exists public.closed_dates (
  date       text primary key check (date ~ '^\d{4}-\d{2}-\d{2}$'),
  reason     text check (reason is null or char_length(btrim(reason)) between 2 and 120),
  created_at timestamptz not null default now()
);

alter table public.closed_dates enable row level security;
revoke all on public.closed_dates from anon, authenticated;

create or replace function public.lock_class_date(p_date text)
returns void
language sql
set search_path = pg_catalog, public
as $$
  select pg_advisory_xact_lock(hashtext('class-date:' || p_date));
$$;

-- Every way a booking lands on a date (new booking, package booking,
-- reschedule) goes through this trigger.
create or replace function public.reject_booking_on_closed_date()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  perform public.lock_class_date(new.date);
  if exists (select 1 from public.closed_dates where date = new.date) then
    raise exception 'DATE_CLOSED' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists bookings_reject_closed_date on public.bookings;
create trigger bookings_reject_closed_date
  before insert or update of date, status on public.bookings
  for each row
  when (new.status <> 'CANCELLED')
  execute function public.reject_booking_on_closed_date();

-- Returns 'CLOSED', or 'ALREADY_CLOSED' when the day was closed before.
-- Raises DATE_HAS_BOOKINGS when any active booking exists on that date.
create or replace function public.close_class_date(p_date text, p_reason text)
returns text
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  perform public.lock_class_date(p_date);

  if exists (
    select 1 from public.bookings
     where date = p_date and status <> 'CANCELLED'
  ) then
    raise exception 'DATE_HAS_BOOKINGS' using errcode = 'P0001';
  end if;

  insert into public.closed_dates (date, reason)
  values (p_date, nullif(btrim(p_reason), ''))
  on conflict (date) do nothing;

  return case when found then 'CLOSED' else 'ALREADY_CLOSED' end;
end;
$$;

revoke all on function public.lock_class_date(text) from public, anon, authenticated;
revoke all on function public.reject_booking_on_closed_date() from public, anon, authenticated;
revoke all on function public.close_class_date(text, text) from public, anon, authenticated;
grant execute on function public.close_class_date(text, text) to service_role;

-- 2. Rate limits for the public endpoints.
--
-- Fixed windows keyed by a hash of the visitor's IP plus the action name.
-- One row per key per window; rows older than a day are swept occasionally.

create table if not exists public.rate_limits (
  key          text not null,
  window_start timestamptz not null,
  hits         integer not null default 1,
  primary key (key, window_start)
);

alter table public.rate_limits enable row level security;
revoke all on public.rate_limits from anon, authenticated;

-- Counts one hit and returns true while the key is still within its limit.
create or replace function public.hit_rate_limit(
  p_key            text,
  p_limit          integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  bucket timestamptz := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );
  total integer;
begin
  insert into public.rate_limits as r (key, window_start)
  values (p_key, bucket)
  on conflict (key, window_start) do update set hits = r.hits + 1
  returning hits into total;

  if random() < 0.02 then
    delete from public.rate_limits where window_start < now() - interval '1 day';
  end if;

  return total <= p_limit;
end;
$$;

revoke all on function public.hit_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.hit_rate_limit(text, integer, integer) to service_role;
