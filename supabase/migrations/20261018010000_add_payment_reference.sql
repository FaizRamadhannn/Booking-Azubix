-- Every new booking gets its own payment reference before the student pays:
--
--   payment_code      human-readable code, e.g. AZB-7F3K2Q, unique
--   amount_due        exact amount to transfer, as on the price list: one
--                     regular session, or the full private package
--   payment_deadline  the slot is held UNPAID until then (5 minutes); after
--                     that the booking is cancelled and the slot released
--
-- Payment states: UNPAID (held, waiting for the transfer) -> PENDING (student
-- says they paid, waiting for admin) -> CONFIRMED (admin checked the transfer).
--
-- Rows created before this migration keep a null payment_code, which the
-- partial unique index ignores.

alter table public.bookings
  add column if not exists payment_code text,
  add column if not exists amount_due integer,
  add column if not exists payment_deadline timestamptz;

update public.bookings set amount_due = price where amount_due is null;

alter table public.bookings
  alter column amount_due set not null;

alter table public.bookings
  drop constraint if exists bookings_payment_status_check,
  add constraint bookings_payment_status_check
    check (payment_status in ('UNPAID', 'PENDING', 'CONFIRMED'));

create unique index if not exists bookings_payment_code_unique
  on public.bookings (payment_code)
  where payment_code is not null;
