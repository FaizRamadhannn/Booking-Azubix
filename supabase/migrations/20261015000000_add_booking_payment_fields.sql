-- Store the canonical price and the admin-reviewed QRIS payment state.
-- Prices are backfilled from level so existing bookings remain readable.

alter table public.bookings
  add column if not exists price integer;

update public.bookings
set price = case level
  when 'A1' then 50000
  when 'A2' then 65000
  when 'B1' then 80000
end
where price is null;

alter table public.bookings
  alter column price set not null,
  add column if not exists payment_status text not null default 'PENDING';

alter table public.bookings
  drop constraint if exists bookings_price_matches_level_check,
  add constraint bookings_price_matches_level_check
    check (
      (level = 'A1' and price = 50000) or
      (level = 'A2' and price = 65000) or
      (level = 'B1' and price = 80000)
    ),
  drop constraint if exists bookings_payment_status_check,
  add constraint bookings_payment_status_check
    check (payment_status in ('PENDING', 'CONFIRMED'));