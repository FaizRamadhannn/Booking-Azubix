-- Migration: run expired booking cleanup once per day
--
-- This migration is required for databases that already applied the original
-- cleanup migration. Editing an applied migration does not change its pg_cron
-- job, so the existing job is explicitly replaced here.

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

-- pg_cron schedules use UTC. 20:00 UTC is 03:00 the next day in WIB.
select cron.schedule(
  'delete-expired-bookings',
  '0 20 * * *',
  $$select public.delete_expired_bookings();$$
);