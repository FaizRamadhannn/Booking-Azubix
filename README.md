# Deutschklasse — Booking Class

A German class booking system: a public student booking page and an admin
dashboard, with persistent data and server-enforced business rules.

Levels **A1**, **A2** and **B1**, Monday to Friday, six fixed time slots a day,
all in **Asia/Jakarta (WIB)**.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase keys
npm run dev
```

- Public booking page — <http://localhost:3000>
- Admin dashboard — <http://localhost:3000/admin/bookings>

### One-time Supabase setup

1. **Run the SQL** from `supabase/migrations/` in the Supabase SQL editor.
   - New project → `…000000_create_bookings_table.sql`
   - Existing `bookings` table → run `supabase/preflight_check.sql` first, clean
     up anything it reports, then `…010000_fix_bookings_constraints_and_rls.sql`
   - Then `…020000_create_admin_users.sql` in both cases
   - Finally run `…030000_schedule_expired_booking_cleanup.sql` and, for a
     database that already ran the previous cleanup migration, also run
     `…040000_reschedule_expired_booking_cleanup_daily.sql`. The final schedule
     runs daily at 03:00 WIB. If the SQL
     editor reports that `pg_cron` is unavailable, enable the `pg_cron`
     extension in Supabase Database → Extensions and run it again.
2. **Turn off public sign-ups** — Authentication → Sign In / Up → _Allow new
   users to sign up_ = **off**. Otherwise anyone could create an account.
3. **Create your admin** — Authentication → Users → Add user (with a password).
4. **Grant them access**:
   ```sql
   insert into public.admin_users (user_id, email)
   select id, email from auth.users where email = 'you@example.com'
   on conflict (user_id) do nothing;
   ```
5. **Fill `.env.local`** from Project Settings → API.

### Manual cleanup test

Run this in the Supabase SQL editor. It uses a transaction so the dummy rows
are always removed at the end. The reference time is `11:31 WIB` on 10
September 2026: the first row must be deleted, while the in-progress and
future rows must remain until the final rollback.

```sql
begin;

insert into public.bookings
  (level, date, slot, student_name, whatsapp_group, last_material)
values
  ('A1', '2026-09-10', '10:00-11:30', 'Cleanup Test Finished', 'Cleanup Test', 'A1'),
  ('A1', '2026-09-10', '12:00-13:30', 'Cleanup Test Active', 'Cleanup Test', 'A1'),
  ('A1', '2026-09-11', '10:00-11:30', 'Cleanup Test Future', 'Cleanup Test', 'A1');

select public.delete_expired_bookings('2026-09-10 04:31:00+00');
-- Expected: 1

select date, slot, student_name
  from public.bookings
 where whatsapp_group = 'Cleanup Test'
 order by date, slot;
-- Expected rows: Cleanup Test Active and Cleanup Test Future

rollback;
```

To verify the installed scheduler and its latest execution:

```sql
select jobname, schedule, active
  from cron.job
 where jobname = 'delete-expired-bookings';

select status, start_time, end_time, return_message
  from cron.job_run_details
 where jobid = (
   select jobid from cron.job
    where jobname = 'delete-expired-bookings'
 )
 order by start_time desc
 limit 5;
```

The first query should return `0 20 * * *` and `active = true`. The second
should show a successful run after the next 03:00 WIB window.

## Configuration

| Variable                               | Secret  | Purpose                                 |
| -------------------------------------- | ------- | --------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | no      | Supabase project URL                    |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | no      | Browser-safe key, used only for sign-in |
| `SUPABASE_SERVICE_ROLE_KEY`            | **yes** | Bypasses RLS; all booking data access   |

> **Never rename `SUPABASE_SERVICE_ROLE_KEY` with a `NEXT_PUBLIC_` prefix.** That
> would ship it to every visitor's browser along with full write access to your
> database.

## Scripts

| Command             | What it does                                           |
| ------------------- | ------------------------------------------------------ |
| `npm run dev`       | Development server                                     |
| `npm test`          | Unit tests for the date and validation logic |
| `npm run typecheck` | `tsc --noEmit`                                         |
| `npm run lint`      | ESLint                                                 |
| `npm run build`     | Production build                                       |

## How booking works

```
Level → Date → Time → Your details → Review → Confirm → Success
```

Slots are shown as **Available**, **Booked** or **Expired**, each with its own
icon and wording so status never depends on colour alone. Booked and expired
slots cannot be selected.
<img width="762" height="564" alt="Screenshot 2026-08-31 at 07 07 56" src="https://github.com/user-attachments/assets/84227d17-0ffc-4b4d-b104-8a3456885092" />
<img width="768" height="485" alt="Screenshot 2026-08-31 at 07 07 21" src="https://github.com/user-attachments/assets/84043182-0cbf-4811-b738-6d20c5faa1e1" />
<img width="748" height="670" alt="Screenshot 2026-08-31 at 07 06 59" src="https://github.com/user-attachments/assets/2818514c-5d90-4059-a74f-7adc7684810a" />
<img width="754" height="404" alt="Screenshot 2026-08-31 at 07 06 43" src="https://github.com/user-attachments/assets/d5960968-9562-471e-b4f8-708d301d0a7e" />


A time slot on a given date holds one class, whatever the level: once an hour is
taken, it is taken for everyone. Duplicate bookings are prevented by a
`UNIQUE (date, timeSlot)` constraint in the database, so two people confirming
the same slot at the same instant cannot both succeed — the second gets a clear
"someone just booked that slot" message and is returned to the time step with a
freshly loaded list.

Every rule is re-checked on the server. The client-side checks exist only to
give faster feedback.

## Admin dashboard

`/admin/bookings` requires a Supabase Auth sign-in **and** membership of the
`admin_users` allowlist — having an account is not enough. It lists every booking with filters for date, level and status,
counters for today and upcoming classes, and a detail modal per booking. It
covers loading, empty, error and populated states, and switches from a table to
stacked cards on small screens.
<img width="1018" height="705" alt="Screenshot 2026-08-31 at 07 09 48" src="https://github.com/user-attachments/assets/1d9ad49b-a47e-49e1-8989-e83e44786562" />


<img width="430" height="425" alt="Screenshot 2026-08-31 at 07 11 00" src="https://github.com/user-attachments/assets/6587dd0f-9ece-4a92-ac1f-b0c6a1525960" />
From the detail modal an admin can:

- **Cancel a booking** — after a confirmation step that spells out the
  consequence. The slot is released immediately so another student can take it,
  while the cancelled booking stays in the list as history.
- **Reschedule a booking** — pick a new date and a free time. The target has to
  pass exactly the same rules a new booking would, and if someone claims that
  slot first the move is rejected rather than silently overwriting them.

Cancelled bookings never block a slot; expired ones do, because the class
already happened.

## Verified

Checked against a production build (`next start`) with a real database:

- A1, A2 and B1 bookings all succeed and persist across a server restart
- Weekend, past-date, out-of-window, unknown-level (including **B2**), invalid
  slot, malformed date and empty-field submissions are all rejected server-side
- 12 simultaneous requests for one slot → exactly one success, eleven conflicts
- Concurrent reschedules into one slot → exactly one success, the rest rejected
- Cancelling frees the slot and it can immediately be booked again; cancelling
  twice, and moving a cancelled booking, are both refused
- Rescheduling onto a taken slot, a weekend, a past date or an invented slot is
  refused, and moving a booking onto its own slot is refused too
- Past classes transition to `EXPIRED` automatically
- Completed bookings are deleted automatically by the database scheduler
- An existing v1 database migrates to the new schema with its rows intact
- Every admin endpoint returns 401 without a valid session and leaves the data
  untouched; the dashboard shows a sign-in form and leaks no student data
- The service-role key appears nowhere in the client bundle
- Admin filters (date, level, status) and the detail modal work
- `npm test` (31 tests), `npm run typecheck`, `npm run lint` and
  `npm run build` all pass clean

See [`project_context.md`](./project_context.md) for architecture and decisions.
# booking-class-azubix

> **Why there is no public demo**
>
> This application is currently used in a real-world setting by me and my students to manage class bookings. For security and privacy reasons, I have decided not to provide a publicly accessible demo at this time.
>
> The source code is available for review, with sensitive credentials, production data, and private configuration excluded from the repository. The project can be evaluated through its architecture, implementation, security controls, database constraints, and automated testing.
