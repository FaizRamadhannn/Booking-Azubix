-- Migration: delete yesterday's finished classes at midnight WIB
--
-- At 00:00 Asia/Jakarta every class dated before today has finished, so the
-- cleanup removes all EXPIRED rows with a date before today (WIB). BOOKED and
-- CANCELLED rows are never deleted. The application performs the same
-- deletion before each read/write as a fallback (see
-- expireFinishedBookings() in src/lib/booking/repository.ts).

create or replace function public.delete_expired_bookings(
  reference_time timestamptz default now()
)
returns integer
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  deleted_count integer;
begin
  delete from public.bookings
   where status = 'EXPIRED'
     and date < to_char(reference_time at time zone 'Asia/Jakarta', 'YYYY-MM-DD');

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke all on function public.delete_expired_bookings(timestamptz) from public;

create extension if not exists pg_cron;

do $$
begin
  if exists (
    select 1
      from cron.job
     where jobname = 'delete-expired-bookings'
  ) then
    perform cron.unschedule('delete-expired-bookings');
  end if;
end;
$$;

-- pg_cron schedules use UTC. 17:00 UTC is 00:00 the next day in WIB.
select cron.schedule(
  'delete-expired-bookings',
  '0 17 * * *',
  $$select public.delete_expired_bookings();$$
);
