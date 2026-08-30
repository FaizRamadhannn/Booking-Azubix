-- Preflight check — run this in the Supabase SQL editor BEFORE applying
-- 20260826010000_fix_bookings_constraints_and_rls.sql
--
-- The original schema had no value constraints, so existing rows may violate
-- the new ones. This is read-only: it changes nothing. Every row it lists must
-- be fixed or deleted first, otherwise the migration will refuse to apply.

select 'level is not A1/A2/B1'                as problem, id, level, date, slot, student_name
  from public.bookings
 where level not in ('A1', 'A2', 'B1')

union all
select 'slot is not one of the six published', id, level, date, slot, student_name
  from public.bookings
 where slot not in (
         '10:00-11:30', '12:00-13:30', '13:30-15:00',
         '15:00-16:30', '16:30-18:00', '18:00-19:30'
       )

union all
select 'date is not YYYY-MM-DD',               id, level, date, slot, student_name
  from public.bookings
 where date !~ '^\d{4}-\d{2}-\d{2}$'

union all
select 'student_name too short/long',          id, level, date, slot, student_name
  from public.bookings
 where length(btrim(student_name)) not between 2 and 80

union all
select 'whatsapp_group too short/long',        id, level, date, slot, student_name
  from public.bookings
 where length(btrim(whatsapp_group)) not between 2 and 80

union all
select 'last_material too short/long',         id, level, date, slot, student_name
  from public.bookings
 where length(btrim(last_material)) not between 2 and 200

order by problem;

-- An empty result means you are clear to run the fix migration.
--
-- If rows come back, they are almost certainly test data or rows written
-- directly through the open anon policy. Delete them by id, for example:
--
--   delete from public.bookings where id in ('...', '...');
