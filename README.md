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
- An existing v1 database migrates to the new schema with its rows intact
- Every admin endpoint returns 401 without a valid session and leaves the data
  untouched; the dashboard shows a sign-in form and leaks no student data
- The service-role key appears nowhere in the client bundle
- Admin filters (date, level, status) and the detail modal work
- `npm test` (31 tests), `npm run typecheck`, `npm run lint` and
  `npm run build` all pass clean

See [`project_context.md`](./project_context.md) for architecture and decisions.
# booking-class-azubix
