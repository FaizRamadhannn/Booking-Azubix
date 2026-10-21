-- Private packages: pay once, then book the remaining sessions with a code.
--
-- The first private booking creates a package (status UNPAID) together with
-- the booking that pays for it. Its status follows that booking's payment:
--
--   UNPAID    -> the first booking is held, waiting for the QRIS transfer
--   PENDING   -> the student reported the transfer
--   CONFIRMED -> the admin matched the transfer; the code can now be used
--   CANCELLED -> the first booking was never paid, or the admin cancelled it
--
-- Later bookings send the package code plus the student's WhatsApp number and
-- go through book_with_private_package(), which uses up one session and
-- creates an already-paid booking atomically. Usage is counted here, not from
-- bookings, because finished bookings are deleted by the nightly cleanup.

create table if not exists public.private_packages (
  id               uuid primary key default gen_random_uuid(),
  package_code     text not null unique,
  level            text not null check (level in ('A1', 'A2', 'B1')),
  sessions_total   integer not null check (sessions_total > 0),
  sessions_used    integer not null default 0,
  status           text not null default 'UNPAID'
                     check (status in ('UNPAID', 'PENDING', 'CONFIRMED', 'CANCELLED')),
  student_name     text not null check (length(btrim(student_name)) between 2 and 80),
  -- Digits only, with country code, e.g. 6281234567890 (wa.me format).
  whatsapp_number  text not null check (whatsapp_number ~ '^[1-9][0-9]{8,14}$'),
  whatsapp_group   text not null check (length(btrim(whatsapp_group)) between 2 and 80),
  amount_paid      integer not null check (amount_paid > 0),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint private_packages_sessions_used_check
    check (sessions_used between 0 and sessions_total)
);

create index if not exists idx_private_packages_status
  on public.private_packages (status);

-- Same policy as bookings: no direct client access, the server uses the
-- service role key.
alter table public.private_packages enable row level security;
revoke all on public.private_packages from anon, authenticated;

alter table public.bookings
  add column if not exists package_id uuid
    references public.private_packages (id) on delete set null,
  add column if not exists whatsapp_number text;

alter table public.bookings
  drop constraint if exists bookings_whatsapp_number_check,
  add constraint bookings_whatsapp_number_check
    check (whatsapp_number is null or whatsapp_number ~ '^[1-9][0-9]{8,14}$'),
  drop constraint if exists bookings_package_private_check,
  add constraint bookings_package_private_check
    check (package_id is null or booking_type = 'PRIVATE');

create index if not exists idx_bookings_package_id on public.bookings (package_id);

-- Books one session of a confirmed package. Locks the package row so two
-- requests can never spend the last session twice; a slot collision raises
-- the bookings_slot_unique violation and rolls everything back.
create or replace function public.book_with_private_package(
  p_package_code    text,
  p_whatsapp_number text,
  p_date            text,
  p_slot            text,
  p_student_name    text,
  p_whatsapp_group  text,
  p_last_material   text,
  p_level           text,
  p_price           integer
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  pkg public.private_packages%rowtype;
  new_id uuid;
begin
  select * into pkg
    from public.private_packages
   where package_code = upper(btrim(p_package_code))
     and whatsapp_number = p_whatsapp_number
     and level = p_level
   for update;

  if not found then
    raise exception 'PACKAGE_NOT_FOUND' using errcode = 'P0001';
  end if;
  if pkg.status <> 'CONFIRMED' then
    raise exception 'PACKAGE_NOT_CONFIRMED' using errcode = 'P0001';
  end if;
  if pkg.sessions_used >= pkg.sessions_total then
    raise exception 'PACKAGE_USED_UP' using errcode = 'P0001';
  end if;

  insert into public.bookings (
    booking_type, level, date, slot, status, price,
    payment_status, payment_code, amount_due, payment_deadline,
    student_name, whatsapp_group, whatsapp_number, last_material, package_id
  ) values (
    'PRIVATE', pkg.level, p_date, p_slot, 'BOOKED', p_price,
    'CONFIRMED', null, 0, null,
    p_student_name, p_whatsapp_group, p_whatsapp_number, p_last_material, pkg.id
  )
  returning id into new_id;

  update public.private_packages
     set sessions_used = sessions_used + 1,
         updated_at = now()
   where id = pkg.id;

  return new_id;
end;
$$;

-- Called when a package booking is cancelled. An unpaid package dies with its
-- first booking; a confirmed one gets the session back.
create or replace function public.release_private_package_session(p_package_id uuid)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  update public.private_packages
     set status = case when status = 'CONFIRMED' then status else 'CANCELLED' end,
         sessions_used = case
           when status = 'CONFIRMED' then greatest(sessions_used - 1, 0)
           else sessions_used
         end,
         updated_at = now()
   where id = p_package_id
     and status <> 'CANCELLED';
end;
$$;

revoke all on function public.book_with_private_package(text, text, text, text, text, text, text, text, integer) from public, anon, authenticated;
revoke all on function public.release_private_package_session(uuid) from public, anon, authenticated;
grant execute on function public.book_with_private_package(text, text, text, text, text, text, text, text, integer) to service_role;
grant execute on function public.release_private_package_session(uuid) to service_role;
