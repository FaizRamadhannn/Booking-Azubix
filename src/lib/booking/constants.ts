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
 * `UNPAID`: slot held while the student pays (see {@link PAYMENT_HOLD_MINUTES}).
 * `PENDING`: student says they paid, waiting for the admin to check.
 * `CONFIRMED`: admin matched the transfer.
 */
export const PAYMENT_STATUSES = ["UNPAID", "PENDING", "CONFIRMED"] as const;

/** How long an unpaid booking holds its slot before it is released. */
export const PAYMENT_HOLD_MINUTES = 5;

/** Payment references look like `AZB-7F3K2Q`. */
export const PAYMENT_CODE_PREFIX = "AZB";
export const PAYMENT_CODE_LENGTH = 6;
export const PAYMENT_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/**
 * Class types a student picks first. Both pay through the QRIS step: regular
 * per session, private as the full package up front.
 */
export const BOOKING_TYPES = ["REGULAR", "PRIVATE"] as const;

/**
 * Prices in Indonesian rupiah; clients may display but never override these.
 * Regular classes are paid per session, rising with the level.
 */
export const REGULAR_PRICES_IDR: Record<(typeof CLASS_LEVELS)[number], number> = {
  A1: 50_000,
  A2: 65_000,
  B1: 80_000,
};

/**
 * Private packages: a cheaper price per session, but the whole package is paid
 * in full up front via QRIS.
 */
export const PRIVATE_PACKAGES: Record<
  (typeof CLASS_LEVELS)[number],
  { pricePerSession: number; sessions: number }
> = {
  A1: { pricePerSession: 30_000, sessions: 35 },
  A2: { pricePerSession: 36_000, sessions: 35 },
  B1: { pricePerSession: 47_000, sessions: 38 },
};

/** What every private package includes, regardless of level. */
export const PRIVATE_PACKAGE_INCLUDES = [
  "e-book",
  "Latihan soal + PR",
  "Pendampingan speaking, grammar, reading, writing",
  "Rekaman kelas",
] as const;

/** The package highlighted as "most popular" on the private plan cards. */
export const PRIVATE_FEATURED_LEVEL: (typeof CLASS_LEVELS)[number] = "A2";

/** Extras bundled with private packages. */
export const PRIVATE_PACKAGE_EXTRAS = [
  "Prüfung test A1",
  "Prüfung test A2",
  "Vorbereitung B1",
  "FREE remedi class",
] as const;

/** Price per session stored on a booking, by class type and level. */
export function pricePerSession(
  type: (typeof BOOKING_TYPES)[number],
  level: (typeof CLASS_LEVELS)[number],
): number {
  return type === "PRIVATE"
    ? PRIVATE_PACKAGES[level].pricePerSession
    : REGULAR_PRICES_IDR[level];
}

/** Full private package price, paid up front. */
export function privatePackageTotal(level: (typeof CLASS_LEVELS)[number]): number {
  const pkg = PRIVATE_PACKAGES[level];
  return pkg.pricePerSession * pkg.sessions;
}

/** Amount the student pays by QRIS when booking. */
export function amountDueNow(
  type: (typeof BOOKING_TYPES)[number],
  level: (typeof CLASS_LEVELS)[number],
): number {
  return type === "PRIVATE" ? privatePackageTotal(level) : REGULAR_PRICES_IDR[level];
}

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
  payerName: { min: 2, max: 80 },
} as const;
