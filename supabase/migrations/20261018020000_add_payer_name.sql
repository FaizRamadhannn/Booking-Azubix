-- The name the transfer was made under (bank account / e-wallet owner), typed
-- by the student when they report the payment. Lets the admin match a QRIS
-- transfer even when someone else paid on the student's behalf.

alter table public.bookings
  add column if not exists payer_name text;

alter table public.bookings
  drop constraint if exists bookings_payer_name_length_check,
  add constraint bookings_payer_name_length_check
    check (payer_name is null or char_length(payer_name) between 2 and 80);
