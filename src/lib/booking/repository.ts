import "server-only";

import { supabaseService } from "@/lib/supabase/service";

import { TIME_SLOTS } from "./constants";
import { minutesOfDayInZone, todayInZone } from "./datetime";
import type { Booking, BookingFilters, CreateBookingInput, IsoDate } from "./types";

/** Postgres error code for a unique-constraint violation. */
const UNIQUE_VIOLATION = "23505";

const TABLE = "bookings";

/** Columns selected everywhere, so every read produces a complete Booking. */
const COLUMNS =
  "id, level, date, slot, status, student_name, whatsapp_group, last_material, created_at, updated_at";

/** The database uses snake_case; the domain model uses camelCase. */
type BookingRow = {
  id: string;
  level: string;
  date: string;
  slot: string;
  status: string;
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
    level: row.level as Booking["level"],
    date: row.date,
    timeSlot: row.slot as Booking["timeSlot"],
    status: row.status as Booking["status"],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function isUniqueViolation(error: { code?: string } | null): boolean {
  return error?.code === UNIQUE_VIOLATION;
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
 * Moves every booking whose class has already finished to `EXPIRED`.
 * Called before each read/write so the stored status is always truthful.
 */
export async function expireFinishedBookings(now: Date = new Date()): Promise<void> {
  const db = supabaseService();
  const today = todayInZone(now);
  const timestamp = new Date().toISOString();

  // Everything strictly before today.
  const { error: pastError } = await db
    .from(TABLE)
    .update({ status: "EXPIRED", updated_at: timestamp })
    .eq("status", "BOOKED")
    .lt("date", today);
  assertNoError(pastError, "expiring past bookings");

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

/**
 * Inserts a booking, relying on the partial UNIQUE index for atomicity.
 * Returns `null` when the slot was taken by a concurrent request.
 */
export async function insertBooking(input: CreateBookingInput): Promise<Booking | null> {
  const db = supabaseService();
  const timestamp = new Date().toISOString();

  const { data, error } = await db
    .from(TABLE)
    .insert({
      level: input.level,
      date: input.date,
      slot: input.timeSlot,
      status: "BOOKED",
      student_name: input.studentName,
      whatsapp_group: input.whatsappGroupName,
      last_material: input.lastMaterial,
      created_at: timestamp,
      updated_at: timestamp,
    })
    .select(COLUMNS)
    .single();

  if (isUniqueViolation(error)) return null;
  assertNoError(error, "creating booking");

  return toBooking(data as unknown as BookingRow);
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
