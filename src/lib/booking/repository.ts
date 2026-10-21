import "server-only";

import { supabaseService } from "@/lib/supabase/service";

import { pricePerSession, TIME_SLOTS } from "./constants";
import { minutesOfDayInZone, todayInZone } from "./datetime";
import type {
  Booking,
  BookingFilters,
  CreateBookingInput,
  IsoDate,
  PrivatePackage,
} from "./types";

/** Postgres error code for a unique-constraint violation. */
const UNIQUE_VIOLATION = "23505";

const TABLE = "bookings";
const PACKAGES = "private_packages";

/** Columns selected everywhere, so every read produces a complete Booking. */
const COLUMNS =
  "id, booking_type, level, date, slot, status, price, payment_status, payment_code, amount_due, payment_deadline, payer_name, student_name, whatsapp_group, whatsapp_number, last_material, package_id, created_at, updated_at, package:private_packages(package_code, sessions_total, sessions_used, status)";

const PACKAGE_COLUMNS =
  "id, package_code, level, sessions_total, sessions_used, status, student_name, whatsapp_number, whatsapp_group, amount_paid, created_at, updated_at";

/** The database uses snake_case; the domain model uses camelCase. */
type BookingRow = {
  id: string;
  booking_type: string;
  level: string;
  date: string;
  slot: string;
  status: string;
  price: number;
  payment_status: string;
  payment_code: string | null;
  amount_due: number;
  payment_deadline: string | null;
  payer_name: string | null;
  student_name: string;
  whatsapp_group: string;
  whatsapp_number: string | null;
  last_material: string;
  package_id: string | null;
  created_at: string;
  updated_at: string;
  package: {
    package_code: string;
    sessions_total: number;
    sessions_used: number;
    status: string;
  } | null;
};

type PackageRow = {
  id: string;
  package_code: string;
  level: string;
  sessions_total: number;
  sessions_used: number;
  status: string;
  student_name: string;
  whatsapp_number: string;
  whatsapp_group: string;
  amount_paid: number;
  created_at: string;
  updated_at: string;
};

function toPackage(row: PackageRow): PrivatePackage {
  return {
    id: row.id,
    packageCode: row.package_code,
    level: row.level as PrivatePackage["level"],
    sessionsTotal: row.sessions_total,
    sessionsUsed: row.sessions_used,
    status: row.status as PrivatePackage["status"],
    studentName: row.student_name,
    whatsappNumber: row.whatsapp_number,
    whatsappGroupName: row.whatsapp_group,
    amountPaid: row.amount_paid,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    studentName: row.student_name,
    whatsappGroupName: row.whatsapp_group,
    lastMaterial: row.last_material,
    bookingType: row.booking_type as Booking["bookingType"],
    level: row.level as Booking["level"],
    date: row.date,
    timeSlot: row.slot as Booking["timeSlot"],
    status: row.status as Booking["status"],
    price: row.price,
    paymentStatus: row.payment_status as Booking["paymentStatus"],
    paymentCode: row.payment_code,
    amountDue: row.amount_due,
    paymentDeadline: row.payment_deadline,
    payerName: row.payer_name,
    whatsappNumber: row.whatsapp_number,
    packageId: row.package_id,
    privatePackage: row.package
      ? {
          packageCode: row.package.package_code,
          sessionsTotal: row.package.sessions_total,
          sessionsUsed: row.package.sessions_used,
          status: row.package.status as PrivatePackage["status"],
        }
      : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function isUniqueViolation(error: { code?: string } | null): boolean {
  return error?.code === UNIQUE_VIOLATION;
}

/** True when the unique violation came from the one-booking-per-slot index. */
function isSlotViolation(error: { message?: string; details?: string } | null): boolean {
  return `${error?.message ?? ""} ${error?.details ?? ""}`.includes("bookings_slot_unique");
}

/** Turns an unexpected PostgREST error into a thrown exception. */
function assertNoError(
  error: { message?: string; code?: string } | null,
  context: string,
): void {
  if (error) {
    throw new Error(`[bookings] ${context}: ${error.message ?? error.code ?? "unknown error"}`);
  }
}

/** Slot ids whose class has already finished today, in Asia/Jakarta. */
function slotsEndedToday(now: Date): string[] {
  const nowMinutes = minutesOfDayInZone(now);
  return TIME_SLOTS.filter((slot) => {
    const [hours, minutes] = slot.end.split(":").map(Number);
    return hours * 60 + minutes <= nowMinutes;
  }).map((slot) => slot.id);
}

/**
 * Cancels bookings that were never paid within their hold window, which
 * releases the slot for other students.
 */
async function releaseUnpaidBookings(now: Date): Promise<void> {
  const { data, error } = await supabaseService()
    .from(TABLE)
    .update({ status: "CANCELLED", updated_at: new Date().toISOString() })
    .eq("status", "BOOKED")
    .eq("payment_status", "UNPAID")
    .lt("payment_deadline", now.toISOString())
    .select("package_id");
  assertNoError(error, "releasing unpaid bookings");

  // A private package bought by an unpaid booking is void as well.
  for (const row of (data ?? []) as Array<{ package_id: string | null }>) {
    if (row.package_id) await releasePackageSession(row.package_id);
  }
}

/**
 * Deletes expired classes from previous days, moves today's finished
 * classes to `EXPIRED`, and releases unpaid holds that ran out of time.
 * Called before each read/write so the stored status is always truthful.
 */
export async function expireFinishedBookings(now: Date = new Date()): Promise<void> {
  await releaseUnpaidBookings(now);
  const db = supabaseService();
  const today = todayInZone(now);
  const timestamp = new Date().toISOString();

  // Expired classes from before today are deleted, mirroring the midnight
  // database cleanup in case the scheduled job has not run yet. BOOKED and
  // CANCELLED rows are never deleted.
  const { error: pastError } = await db
    .from(TABLE)
    .delete()
    .eq("status", "EXPIRED")
    .lt("date", today);
  assertNoError(pastError, "deleting past expired bookings");

  // Plus today's classes that have already ended.
  const ended = slotsEndedToday(now);
  if (ended.length > 0) {
    const { error: todayError } = await db
      .from(TABLE)
      .update({ status: "EXPIRED", updated_at: timestamp })
      .eq("status", "BOOKED")
      .eq("date", today)
      .in("slot", ended);
    assertNoError(todayError, "expiring finished classes today");
  }
}

export interface PaymentReference {
  paymentCode: string;
  amountDue: number;
  paymentDeadline: Date;
}

export type InsertResult =
  | { ok: true; booking: Booking }
  | { ok: false; conflict: "slot" | "payment" };

/**
 * Inserts an `UNPAID` booking, relying on the partial UNIQUE indexes for
 * atomicity. A `slot` conflict means a concurrent request took the slot; a
 * `payment` conflict means the code or amount collided and should be redrawn.
 */
export async function insertBooking(
  input: CreateBookingInput,
  payment: PaymentReference,
  packageId: string | null = null,
): Promise<InsertResult> {
  const db = supabaseService();
  const timestamp = new Date().toISOString();

  const { data, error } = await db
    .from(TABLE)
    .insert({
      booking_type: input.bookingType,
      level: input.level,
      date: input.date,
      slot: input.timeSlot,
      status: "BOOKED",
      price: pricePerSession(input.bookingType, input.level),
      payment_status: "UNPAID",
      payment_code: payment.paymentCode,
      amount_due: payment.amountDue,
      payment_deadline: payment.paymentDeadline.toISOString(),
      student_name: input.studentName,
      whatsapp_group: input.whatsappGroupName,
      whatsapp_number: input.whatsappNumber ?? null,
      last_material: input.lastMaterial,
      package_id: packageId,
      created_at: timestamp,
      updated_at: timestamp,
    })
    .select(COLUMNS)
    .single();

  if (isUniqueViolation(error)) {
    return { ok: false, conflict: isSlotViolation(error) ? "slot" : "payment" };
  }
  assertNoError(error, "creating booking");

  return { ok: true, booking: toBooking(data as unknown as BookingRow) };
}

/**
 * The student reports the transfer. Only succeeds while the hold is still
 * live, and only once — a second click finds nothing `UNPAID` to update.
 */
export async function markBookingPaidById(
  id: string,
  paymentCode: string,
  payerName: string,
  now: Date,
): Promise<Booking | null> {
  const { data, error } = await supabaseService()
    .from(TABLE)
    .update({
      payment_status: "PENDING",
      payer_name: payerName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("payment_code", paymentCode)
    .eq("status", "BOOKED")
    .eq("payment_status", "UNPAID")
    .gt("payment_deadline", now.toISOString())
    .select(COLUMNS)
    .maybeSingle();

  assertNoError(error, "marking booking as paid");
  return data ? toBooking(data as unknown as BookingRow) : null;
}

export async function confirmBookingPaymentById(
  id: string,
): Promise<Booking | null> {
  const db = supabaseService();
  const { data, error } = await db
    .from(TABLE)
    .update({
      payment_status: "CONFIRMED",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .neq("status", "CANCELLED")
    .in("payment_status", ["UNPAID", "PENDING"])
    .select(COLUMNS)
    .maybeSingle();

  assertNoError(error, "confirming booking payment");
  return data ? toBooking(data as unknown as BookingRow) : null;
}

/**
 * Bookings on a date that still *occupy* their slot. Cancelled bookings are
 * excluded: they keep their history but release the slot.
 */
export async function findOccupyingBookingsByDate(date: IsoDate): Promise<Booking[]> {
  const db = supabaseService();
  const { data, error } = await db
    .from(TABLE)
    .select(COLUMNS)
    .eq("date", date)
    .neq("status", "CANCELLED")
    .order("slot", { ascending: true });

  assertNoError(error, "loading bookings for a date");
  return (data as unknown as BookingRow[]).map(toBooking);
}

/** Slot-occupying bookings across a date range, used to annotate the date picker. */
export async function findOccupyingBookingsBetween(
  from: IsoDate,
  to: IsoDate,
): Promise<Booking[]> {
  const db = supabaseService();
  const { data, error } = await db
    .from(TABLE)
    .select(COLUMNS)
    .gte("date", from)
    .lte("date", to)
    .neq("status", "CANCELLED")
    .order("date", { ascending: true })
    .order("slot", { ascending: true });

  assertNoError(error, "loading bookings for the calendar");
  return (data as unknown as BookingRow[]).map(toBooking);
}

export async function findBookingById(id: string): Promise<Booking | null> {
  const db = supabaseService();
  const { data, error } = await db.from(TABLE).select(COLUMNS).eq("id", id).maybeSingle();

  assertNoError(error, "loading a booking");
  return data ? toBooking(data as unknown as BookingRow) : null;
}

/**
 * Marks a booking cancelled, releasing its slot. Returns the updated booking,
 * or `null` when the id does not exist.
 */
export async function cancelBookingById(id: string): Promise<Booking | null> {
  const db = supabaseService();
  const { data, error } = await db
    .from(TABLE)
    .update({ status: "CANCELLED", updated_at: new Date().toISOString() })
    .eq("id", id)
    .neq("status", "CANCELLED")
    .select(COLUMNS)
    .maybeSingle();

  assertNoError(error, "cancelling a booking");
  return data ? toBooking(data as unknown as BookingRow) : null;
}

/**
 * Moves a booking to a different date and slot, resetting it to `BOOKED`.
 * Returns `null` when the target slot is already taken — the partial UNIQUE
 * index makes that check atomic, so a concurrent booking cannot slip through.
 */
export async function rescheduleBookingById(
  id: string,
  date: IsoDate,
  timeSlot: string,
): Promise<Booking | null> {
  const db = supabaseService();
  const { data, error } = await db
    .from(TABLE)
    .update({
      date,
      slot: timeSlot,
      status: "BOOKED",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(COLUMNS)
    .maybeSingle();

  if (isUniqueViolation(error)) return null;
  assertNoError(error, "rescheduling a booking");

  return data ? toBooking(data as unknown as BookingRow) : null;
}

/** Admin listing, earliest class first. Filters are applied in the database. */
export async function findBookings(filters: BookingFilters = {}): Promise<Booking[]> {
  const db = supabaseService();
  let query = db.from(TABLE).select(COLUMNS);

  if (filters.date) query = query.eq("date", filters.date);
  if (filters.level) query = query.eq("level", filters.level);
  if (filters.status) query = query.eq("status", filters.status);

  const { data, error } = await query
    .order("date", { ascending: true })
    .order("slot", { ascending: true });

  assertNoError(error, "listing bookings");
  return (data as unknown as BookingRow[]).map(toBooking);
}

// ---------------------------------------------------------------------------
// Private packages
// ---------------------------------------------------------------------------

export interface NewPackage {
  packageCode: string;
  level: CreateBookingInput["level"];
  sessionsTotal: number;
  amountPaid: number;
  studentName: string;
  whatsappNumber: string;
  whatsappGroupName: string;
}

/**
 * Creates an `UNPAID` package that already counts the booking paying for it
 * as its first session. Returns `null` when the code collided and should be
 * redrawn.
 */
export async function insertPackage(input: NewPackage): Promise<PrivatePackage | null> {
  const timestamp = new Date().toISOString();
  const { data, error } = await supabaseService()
    .from(PACKAGES)
    .insert({
      package_code: input.packageCode,
      level: input.level,
      sessions_total: input.sessionsTotal,
      sessions_used: 1,
      status: "UNPAID",
      student_name: input.studentName,
      whatsapp_number: input.whatsappNumber,
      whatsapp_group: input.whatsappGroupName,
      amount_paid: input.amountPaid,
      created_at: timestamp,
      updated_at: timestamp,
    })
    .select(PACKAGE_COLUMNS)
    .single();

  if (isUniqueViolation(error)) return null;
  assertNoError(error, "creating private package");
  return toPackage(data as unknown as PackageRow);
}

/** Removes a package whose first booking could not be created. */
export async function deletePackage(id: string): Promise<void> {
  const { error } = await supabaseService().from(PACKAGES).delete().eq("id", id);
  assertNoError(error, "deleting private package");
}

/** Follows the paying booking: `UNPAID` -> `PENDING` -> `CONFIRMED`. */
export async function advancePackageStatus(
  id: string,
  next: "PENDING" | "CONFIRMED",
): Promise<void> {
  const from = next === "PENDING" ? ["UNPAID"] : ["UNPAID", "PENDING"];
  const { error } = await supabaseService()
    .from(PACKAGES)
    .update({ status: next, updated_at: new Date().toISOString() })
    .eq("id", id)
    .in("status", from);
  assertNoError(error, "updating private package status");
}

/** Gives a cancelled session back, or voids a package that was never paid. */
export async function releasePackageSession(id: string): Promise<void> {
  const { error } = await supabaseService().rpc("release_private_package_session", {
    p_package_id: id,
  });
  assertNoError(error, "releasing a private package session");
}

export type PackageBookingResult =
  | { ok: true; bookingId: string }
  | {
      ok: false;
      reason: "slot" | "PACKAGE_NOT_FOUND" | "PACKAGE_NOT_CONFIRMED" | "PACKAGE_USED_UP";
    };

const PACKAGE_ERRORS = ["PACKAGE_NOT_FOUND", "PACKAGE_NOT_CONFIRMED", "PACKAGE_USED_UP"] as const;

/**
 * Books one session from a confirmed package. The database function checks the
 * package, inserts the paid booking and counts the session in one transaction.
 */
export async function bookWithPackage(
  input: CreateBookingInput & { packageCode: string; whatsappNumber: string },
): Promise<PackageBookingResult> {
  const { data, error } = await supabaseService().rpc("book_with_private_package", {
    p_package_code: input.packageCode,
    p_whatsapp_number: input.whatsappNumber,
    p_date: input.date,
    p_slot: input.timeSlot,
    p_student_name: input.studentName,
    p_whatsapp_group: input.whatsappGroupName,
    p_last_material: input.lastMaterial,
    p_level: input.level,
    p_price: pricePerSession("PRIVATE", input.level),
  });

  if (isUniqueViolation(error)) return { ok: false, reason: "slot" };
  const known = PACKAGE_ERRORS.find((code) => error?.message?.includes(code));
  if (known) return { ok: false, reason: known };
  assertNoError(error, "booking with a private package");
  return { ok: true, bookingId: data as string };
}

export async function findPackageByCode(
  packageCode: string,
  whatsappNumber: string,
): Promise<PrivatePackage | null> {
  const { data, error } = await supabaseService()
    .from(PACKAGES)
    .select(PACKAGE_COLUMNS)
    .eq("package_code", packageCode)
    .eq("whatsapp_number", whatsappNumber)
    .maybeSingle();
  assertNoError(error, "loading a private package");
  return data ? toPackage(data as unknown as PackageRow) : null;
}

/** Admin listing, newest first. */
export async function findPackages(): Promise<PrivatePackage[]> {
  const { data, error } = await supabaseService()
    .from(PACKAGES)
    .select(PACKAGE_COLUMNS)
    .order("created_at", { ascending: false });
  assertNoError(error, "listing private packages");
  return (data as unknown as PackageRow[]).map(toPackage);
}
