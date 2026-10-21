import "server-only";

import { supabaseService } from "@/lib/supabase/service";

import { pricePerSession, TIME_SLOTS } from "./constants";
import { minutesOfDayInZone, todayInZone } from "./datetime";
import type { Booking, BookingFilters, CreateBookingInput, IsoDate } from "./types";

/** Postgres error code for a unique-constraint violation. */
const UNIQUE_VIOLATION = "23505";

const TABLE = "bookings";

/** Columns selected everywhere, so every read produces a complete Booking. */
const COLUMNS =
  "id, booking_type, level, date, slot, status, price, payment_status, payment_code, amount_due, payment_deadline, payer_name, student_name, whatsapp_group, last_material, created_at, updated_at";

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
  last_material: string;
  created_at: string;
  updated_at: string;
};

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
  const { error } = await supabaseService()
    .from(TABLE)
    .update({ status: "CANCELLED", updated_at: new Date().toISOString() })
    .eq("status", "BOOKED")
    .eq("payment_status", "UNPAID")
    .lt("payment_deadline", now.toISOString());
  assertNoError(error, "releasing unpaid bookings");
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
      last_material: input.lastMaterial,
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
