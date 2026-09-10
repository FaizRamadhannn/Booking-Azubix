# Project context — Booking Class

Source of truth for this repository's architecture, decisions and progress.
Read this before changing anything; preserve working code.

## What this is

A German class booking system with a public student booking page and an admin
dashboard. It is **not** an e-commerce system: there is no payment, checkout,
cart, CRM or analytics, and none should be added.

## Stack

- Next.js 16 (App Router, Turbopack) + React 19
- TypeScript (strict)
- Tailwind CSS v4
- shadcn/ui (`base-nova` style, built on Base UI — **not** Radix)
- Zod for validation shared between client and server
- Supabase (Postgres) for persistence, `@supabase/ssr` for admin authentication

## Business rules (all centralised in `src/lib/booking/constants.ts`)

| Rule           | Value                                                                                    |
| -------------- | ---------------------------------------------------------------------------------------- |
| Levels         | `A1`, `A2`, `B1` — **B2 must never exist anywhere**                                      |
| Days           | Monday–Friday. Saturday and Sunday are always closed                                     |
| Time slots     | `10:00-11:30`, `12:00-13:30`, `13:30-15:00`, `15:00-16:30`, `16:30-18:00`, `18:00-19:30` |
| Timezone       | `Asia/Jakarta` (WIB) — every "today" and expiry decision is made in this zone            |
| Statuses       | `AVAILABLE` (slots only), `BOOKED`, `EXPIRED`, `CANCELLED`                               |
| Booking window | Today through today + 28 days                                                            |

Nothing outside `constants.ts` may hardcode a level, slot, weekday or timezone.

### Key modelling decision: one slot belongs to the tutor, not to a level

A time slot on a date can hold **exactly one** booking regardless of level.
Once 12:00–13:30 on a date is taken by an A1 class, no level can book that hour.
This is enforced by a partial `UNIQUE (date, slot)` index in Postgres, which is
also what makes duplicate protection race-proof.

If the school ever runs parallel classes, the change is: widen that index and
update `resolveSlots()` in `src/lib/booking/service.ts`.

### Expiry

A slot expires once its class has **finished** (not when it starts), so a lesson
in progress never vanishes mid-class. `expireFinishedBookings()` runs before
every read and write, so a stored `status` is always truthful while the row
exists. The database scheduler then deletes completed `BOOKED`/`EXPIRED` rows.

### Cancellation vs expiry

`CANCELLED` is the only status that **releases** a slot — see
`SLOT_RELEASING_STATUSES`. An expired booking keeps its slot while it exists,
because the class already happened; the scheduled cleanup later removes it.

That is enforced by making the slot index _partial_:

```sql
CREATE UNIQUE INDEX bookings_slot_unique
  ON bookings (date, timeSlot)
  WHERE status <> 'CANCELLED';
```

So a cancelled row stays in the table for the record but stops reserving its
hour. Availability queries (`findOccupyingBookings*`) also exclude cancelled
rows; the admin listing (`findBookings`) does not, so history stays visible.

### Schema migrations

## Layout

```
src/
  lib/
    booking/
      constants.ts     business rules — the single source of truth
      types.ts         domain types derived from the constants
      datetime.ts      Asia/Jakarta date + slot maths (pure, unit tested)
      errors.ts        BookingError + error codes -> HTTP status mapping
      validation.ts    Zod schemas shared by client and server (pure)
      repository.ts    Supabase data access — server only
      service.ts       business logic — server only
      *.test.ts        node:test suites for the pure modules
    auth/
      admin.ts         Supabase Auth + admin allowlist check — server only
    supabase/
      env.ts           validated environment access — server only
      server.ts        request-scoped auth client (publishable key)
      service.ts       service-role client for all data access
  app/
    page.tsx                     public page (Server Component)
    layout.tsx                   root layout, fonts, skip link
    api/availability/route.ts    calendar + schedule metadata
    api/availability/[date]/     slot availability for one date
    api/bookings/route.ts        POST create (public), GET list (admin only)
    api/bookings/[id]/route.ts   GET one, PATCH cancel/reschedule (admin only)
    admin/actions.ts             sign in / sign out Server Actions
    admin/bookings/page.tsx      admin dashboard route
  components/
    site/       header, hero, footer
    booking/    the student flow: stepper + one component per step
    admin/      dashboard, filters, table, BookingDetailModal, RescheduleForm
    ui/         shadcn primitives — do not hand-edit
```

Server Components are the default. Only the booking flow, the admin dashboard
and their children are Client Components, because they need interaction.

## Data flow

- The public page renders the calendar **on the server** for the first paint,
  then the client refetches `/api/availability` after a booking.
- The admin page renders the first page of bookings on the server, then the
  client refetches `/api/bookings` on filter change and refresh.
- `createBooking()` re-validates every field on the server. The client is never
  trusted; the client-side Zod pass exists only to give fast feedback.

## Admin operations

`PATCH /api/bookings/:id` takes a discriminated payload:

```json
{ "action": "cancel" }
{ "action": "reschedule", "date": "2026-09-01", "timeSlot": "10:00-11:30" }
```

- **Cancel** is allowed only from `BOOKED`, and releases the slot.
- **Reschedule** is allowed from `BOOKED` or `EXPIRED` (moving a missed class
  forward is a real use case) but never from `CANCELLED`. The target must pass
  every rule a new booking would, and the move is atomic — a concurrent claim on
  the target slot is rejected by the partial UNIQUE index, not by a pre-check.

Both are admin-only and re-validated on the server.

## Duplicate protection

Three layers, of which only the last is authoritative:

1. The UI does not let a student select a `BOOKED` or `EXPIRED` slot.
2. `createBooking()` checks for an existing booking before inserting.
3. **The partial `UNIQUE (date, slot)` index in Postgres.** If two requests
   race past step 2, the second write fails and the service returns
   `SLOT_TAKEN` (HTTP 409). This covers reschedules as well as new bookings.

Verified: 12 simultaneous requests for one slot produce exactly one 201 and
eleven 409s, and concurrent _reschedules_ into one slot behave the same way.

## Admin access

Two independent checks, both required:

1. **Authentication** — Supabase Auth email + password. `getAdmin()` calls
   `auth.getUser()`, which revalidates the JWT with Supabase. Never use
   `getSession()` for this: it only reads the cookie and can be spoofed.
2. **Authorisation** — the user id must appear in `public.admin_users`.

Holding a Supabase account is therefore not enough to see student data. The
allowlist is written only by hand with the service role, so a signed-in user
cannot promote themselves.

Sign-in also re-checks the allowlist and calls `signOut()` if the account is not
on it, so a non-admin never keeps a live session. Error messages are deliberately
vague ("Those details are not correct") so the form cannot be used to discover
which addresses have accounts.

**Keep public sign-ups disabled** in Supabase (Authentication → Sign In / Up).
Create admins from the dashboard, then add them to `admin_users`.

## Schema migrations

SQL lives in `supabase/migrations/`, applied through the Supabase SQL editor:

| File                                           | Purpose                                      |
| ---------------------------------------------- | -------------------------------------------- |
| `…000000_create_bookings_table.sql`            | Fresh install of `bookings`                  |
| `…010000_fix_bookings_constraints_and_rls.sql` | Upgrade path for an earlier `bookings` table |
| `…020000_create_admin_users.sql`               | Admin allowlist                              |
| `…030000_schedule_expired_booking_cleanup.sql` | Scheduled deletion of completed bookings    |
| `…040000_reschedule_expired_booking_cleanup_daily.sql` | Daily cleanup schedule                  |

`supabase/preflight_check.sql` reports rows that would violate the new
constraints. Run it before the fix migration.

Both tables use **RLS enabled with no policies**. That denies `anon` and
`authenticated` everything; the server reaches the data with the service role
key, which bypasses RLS. Do not add an anon policy — the publishable key ships
to the browser, so any policy there lets people write straight to PostgREST and
skip every server-side rule.

## Environment variables

| Name                                   | Secret  | Purpose                              |
| -------------------------------------- | ------- | ------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`             | no      | Supabase project URL                 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | no      | Browser-safe key, used only for auth |
| `SUPABASE_SERVICE_ROLE_KEY`            | **yes** | Bypasses RLS; all data access        |

`SUPABASE_SERVICE_ROLE_KEY` must never gain a `NEXT_PUBLIC_` prefix — that would
ship full write access to every visitor. Every module that reads it starts with
`import "server-only"`, so an accidental client import fails the build.

## Commands

```
npm run dev        # development server
npm test           # node:test suites for the pure modules
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm run build      # production build
```

`npm test` uses Node's native TypeScript support. `test/ts-hooks.mjs` teaches
Node's ESM loader to resolve the app's extensionless relative imports.

## Accessibility commitments

- Booking status is conveyed by icon **and** text, never colour alone.
- Cancelling asks for confirmation and spells out the consequence first.
- Every step transition moves focus to the step heading.
- Slot buttons carry an `aria-label` explaining _why_ a slot is unavailable.
- Native form controls, real `<label>`s, `aria-invalid` + `aria-describedby`
  on every field error, visible focus rings, and a skip link.
- `prefers-reduced-motion` is respected globally.

## Status

Complete and verified. See the README for what has been tested.
