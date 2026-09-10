-- Migration: automatically remove bookings after their class has finished
--
-- The date and slot columns are local Asia/Jakarta values. The comparison is
-- made by converting the slot end to a timestamptz explicitly, so it does not
-- depend on the database session timezone.

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
   where status in ('BOOKED', 'EXPIRED')
     and (
       (date || ' ' || split_part(slot, '-', 2))::timestamp
         at time zone 'Asia/Jakarta'
     ) < reference_time;

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

-- The function is for the scheduled database job only. Do not expose a
-- delete capability through the public or authenticated database roles.
revoke all on function public.delete_expired_bookings(timestamptz) from public;

-- pg_cron is available in Supabase projects through the Extensions system.
create extension if not exists pg_cron;

-- Make the migration safe to re-run in the SQL editor.
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

select cron.schedule(
  'delete-expired-bookings',
  '0 20 * * *',
  $$select public.delete_expired_bookings();$$
);