/**
 * Single source of truth for every business rule of the Booking Class system.
 * Nothing in the UI, the API or the data layer may hardcode these values.
 */

/** IANA timezone the school operates in. All dates/times are interpreted in WIB. */
export const TIMEZONE = "Asia/Jakarta" as const;
export const TIMEZONE_LABEL = "WIB (Asia/Jakarta)" as const;

/** The only class levels that exist. There is deliberately no B2. */
export const CLASS_LEVELS = ["A1", "A2", "B1"] as const;

/**
 * Fixed weekly time slots. Students can never define their own.
 * `start`/`end` are local wall-clock times in {@link TIMEZONE}.
 */
export const TIME_SLOTS = [
  { id: "10:00-11:30", start: "10:00", end: "11:30" },
  { id: "12:00-13:30", start: "12:00", end: "13:30" },
  { id: "13:30-15:00", start: "13:30", end: "15:00" },
  { id: "15:00-16:30", start: "15:00", end: "16:30" },
  { id: "16:30-18:00", start: "16:30", end: "18:00" },
  { id: "18:00-19:30", start: "18:00", end: "19:30" },
] as const;

export const TIME_SLOT_IDS = TIME_SLOTS.map((slot) => slot.id);

/** Booking / slot statuses. `AVAILABLE` only ever describes a free slot. */
export const BOOKING_STATUSES = [
  "AVAILABLE",
  "BOOKED",
  "EXPIRED",
  "CANCELLED",
] as const;

/** The statuses a stored booking can actually hold. */
export const BOOKING_RECORD_STATUSES = [
  "BOOKED",
  "EXPIRED",
  "CANCELLED",
] as const;

/**
 * A cancelled booking releases its slot; an expired one does not, because the
 * class already happened and the history has to stay intact.
 */
export const SLOT_RELEASING_STATUSES = ["CANCELLED"] as const;

/**
 * Classes run Monday–Friday only. Values follow `Date.prototype.getUTCDay()`
 * (0 = Sunday … 6 = Saturday).
 */
export const OPEN_WEEKDAYS = [1, 2, 3, 4, 5] as const;

/** How far ahead students may book, counted from "today" in {@link TIMEZONE}. */
export const BOOKING_WINDOW_DAYS = 28;

/** Field length limits, enforced identically on the client and the server. */
export const FIELD_LIMITS = {
  studentName: { min: 2, max: 80 },
  whatsappGroupName: { min: 2, max: 80 },
  lastMaterial: { min: 2, max: 200 },
} as const;
