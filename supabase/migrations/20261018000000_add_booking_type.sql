-- Students now choose PRIVATE or REGULAR before booking.
--
-- REGULAR: per session by level (A1 50.000, A2 65.000, B1 80.000), paid per
--          session via QRIS.
-- PRIVATE: cheaper per session (A1 30.000, A2 36.000, B1 47.000), but the
--          whole package is paid in full up front via QRIS.
--
-- `price` stores the price of the booked session. Existing rows were all
-- regular bookings at these same per-level prices, so they stay valid.

alter table public.bookings
  add column if not exists booking_type text not null default 'REGULAR';

alter table public.bookings
  drop constraint if exists bookings_booking_type_check,
  add constraint bookings_booking_type_check
    check (booking_type in ('REGULAR', 'PRIVATE'));

alter table public.bookings
  drop constraint if exists bookings_price_matches_level_check,
  add constraint bookings_price_matches_level_check
    check (
      (booking_type = 'REGULAR' and (
        (level = 'A1' and price = 50000) or
        (level = 'A2' and price = 65000) or
        (level = 'B1' and price = 80000)
      )) or
      (booking_type = 'PRIVATE' and (
        (level = 'A1' and price = 30000) or
        (level = 'A2' and price = 36000) or
        (level = 'B1' and price = 47000)
      ))
    );
