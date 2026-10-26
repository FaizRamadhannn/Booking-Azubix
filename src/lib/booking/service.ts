import "server-only";

import { randomInt } from "node:crypto";

import {
  amountDueNow,
  BOOKING_WINDOW_DAYS,
  PRIVATE_PACKAGES,
  TIME_SLOTS,
} from "./constants";
import {
  bookingWindowDates,
  formatShortDate,
  isSlotPast,
  isValidIsoDate,
  isWeekend,
  lastBookableDate,
  todayInZone,
} from "./datetime";
import { BookingError } from "./errors";
import {
  advancePackageStatus,
  bookWithPackage,
  cancelBookingById,
  closeDate,
  confirmBookingPaymentById,
  deletePackage,
  expireFinishedBookings,
  findBookingById,
  findBookings,
  findClosedDates,
  findOccupyingBookingsBetween,
  findOccupyingBookingsByDate,
  findPackageByCode,
  findPackages,
  insertBooking,
  insertPackage,
  isDateClosed,
  markBookingPaidById,
  releasePackageSession,
  reopenDate,
  rescheduleBookingById,
} from "./repository";
import { generatePackageCode, generatePaymentCode, paymentDeadline } from "./payment";
import type {
  Booking,
  BookingFilters,
  CalendarDay,
  ClosedDate,
  CreateBookingInput,
  DayAvailability,
  IsoDate,
  PackageLookup,
  PrivatePackage,
  SlotAvailability,
  TimeSlotId,
} from "./types";
import {
  assertBookableDate,
  closeDaySchema,
  markPaidSchema,
  packageLookupSchema,
  parseBookingAction,
  parseCreateBookingInput,
  toFieldErrors,
} from "./validation";

/**
 * A slot belongs to the tutor, not to a level: once any level has booked
 * 12:00–13:30 on a date, nobody else can take that hour.
 */
function resolveSlots(
  date: IsoDate,
  bookings: Booking[],
  now: Date,
): SlotAvailability[] {
  const bySlot = new Map(
    bookings.map((booking) => [booking.timeSlot, booking]),
  );

  return TIME_SLOTS.map((slot): SlotAvailability => {
    const booking = bySlot.get(slot.id);
    if (isSlotPast(date, slot, now)) {
      return {
        timeSlot: slot.id,
        start: slot.start,
        end: slot.end,
        status: "EXPIRED",
        bookedLevel: booking?.level ?? null,
        reason: "This class has already finished.",
      };
    }
    if (booking) {
      return {
        timeSlot: slot.id,
        start: slot.start,
        end: slot.end,
        status: "BOOKED",
        bookedLevel: booking.level,
        reason: `Already booked for a ${booking.level} class.`,
      };
    }
    return {
      timeSlot: slot.id,
      start: slot.start,
      end: slot.end,
      status: "AVAILABLE",
      bookedLevel: null,
      reason: "Available to book.",
    };
  });
}

const DAY_OFF_REASON = "There is no class on this day.";

/** Why the whole day cannot be booked, or `null` when it is open. */
function closedReasonFor(date: IsoDate, now: Date, dayOff: boolean): string | null {
  if (isWeekend(date)) return "Classes run Monday to Friday only.";
  if (date < todayInZone(now)) return "This date has already passed.";
  if (date > lastBookableDate(now)) {
    return `Bookings open ${BOOKING_WINDOW_DAYS} days ahead, up to ${formatShortDate(lastBookableDate(now))}.`;
  }
  if (dayOff) return DAY_OFF_REASON;
  return null;
}

/** Friendly early rejection; the database trigger is the real guarantee. */
async function assertDayOpen(date: IsoDate): Promise<void> {
  if (await isDateClosed(date)) {
    throw new BookingError("DATE_CLOSED", DAY_OFF_REASON, { date: DAY_OFF_REASON });
  }
}

/** Slot-by-slot availability for one date. */
export async function getDayAvailability(
  date: IsoDate,
  now: Date = new Date(),
): Promise<DayAvailability> {
  await expireFinishedBookings(now);
  const dayOff = !isWeekend(date) && (await isDateClosed(date));
  const closedReason = closedReasonFor(date, now, dayOff);
  if (closedReason) {
    return { date, isOpen: false, closedReason, dayOff, slots: [] };
  }
  return {
    date,
    isOpen: true,
    closedReason: null,
    dayOff: false,
    slots: resolveSlots(date, await findOccupyingBookingsByDate(date), now),
  };
}

/** The date strip shown in the booking flow, annotated with remaining capacity. */
export async function getCalendar(
  now: Date = new Date(),
): Promise<CalendarDay[]> {
  await expireFinishedBookings(now);
  const dates = bookingWindowDates(now);
  const today = todayInZone(now);
  const [bookings, closed] = await Promise.all([
    findOccupyingBookingsBetween(dates[0], dates[dates.length - 1]),
    findClosedDates(dates[0], dates[dates.length - 1]),
  ]);
  const closedDates = new Set(closed.map((day) => day.date));

  const bookedByDate = new Map<IsoDate, Set<string>>();
  for (const booking of bookings) {
    const set = bookedByDate.get(booking.date) ?? new Set<string>();
    set.add(booking.timeSlot);
    bookedByDate.set(booking.date, set);
  }

  return dates.map((date): CalendarDay => {
    const day = new Date(`${date}T00:00:00Z`);
    const weekend = isWeekend(date);
    const dayOff = !weekend && closedDates.has(date);
    const taken = bookedByDate.get(date) ?? new Set<string>();
    const availableSlots = weekend || dayOff
      ? 0
      : TIME_SLOTS.filter(
          (slot) => !taken.has(slot.id) && !isSlotPast(date, slot, now),
        ).length;

    return {
      date,
      weekdayShort: day.toLocaleDateString("en-GB", {
        timeZone: "UTC",
        weekday: "short",
      }),
      dayOfMonth: String(day.getUTCDate()),
      monthShort: day.toLocaleDateString("en-GB", {
        timeZone: "UTC",
        month: "short",
      }),
      isWeekend: weekend,
      isDayOff: dayOff,
      isToday: date === today,
      selectable: !weekend && !dayOff && availableSlots > 0,
      availableSlots,
      totalSlots: TIME_SLOTS.length,
    };
  });
}

/**
 * Validates untrusted input against every business rule and persists the
 * booking. The final collision check is the database's UNIQUE index, so two
 * requests racing for the same slot can never both succeed.
 */
export async function createBooking(
  input: unknown,
  now: Date = new Date(),
): Promise<Booking> {
  const payload = parseCreateBookingInput(input);
  assertBookableDate(payload.date, now);
  await assertDayOpen(payload.date);

  await expireFinishedBookings(now);

  const slot = TIME_SLOTS.find(
    (candidate) => candidate.id === payload.timeSlot,
  )!;
  if (isSlotPast(payload.date, slot, now)) {
    throw new BookingError(
      "SLOT_EXPIRED",
      "That time slot has already passed.",
      {
        timeSlot: "That time slot has already passed.",
      },
    );
  }

  // Fast path: a friendly error before we even attempt the insert.
  const taken = (await findOccupyingBookingsByDate(payload.date)).some(
    (booking) => booking.timeSlot === payload.timeSlot,
  );
  if (taken) throw slotTakenError();

  if (payload.packageCode && payload.whatsappNumber) {
    return createPackageBooking({
      ...payload,
      packageCode: payload.packageCode,
      whatsappNumber: payload.whatsappNumber,
    });
  }

  // A first private booking buys the whole package: create the package first,
  // so the booking that pays for it can point at it.
  let packageId: string | null = null;
  if (payload.bookingType === "PRIVATE") {
    packageId = (await createPackage(payload)).id;
  }

  try {
    return await insertWithPaymentReference(payload, packageId, now);
  } catch (error) {
    if (packageId) await deletePackage(packageId);
    throw error;
  }
}

/** Inserts an UNPAID hold, redrawing the random payment code on a collision. */
async function insertWithPaymentReference(
  payload: CreateBookingInput,
  packageId: string | null,
  now: Date,
): Promise<Booking> {
  for (let attempt = 0; attempt < PAYMENT_REFERENCE_ATTEMPTS; attempt += 1) {
    const result = await insertBooking(
      payload,
      {
        paymentCode: generatePaymentCode(randomInt),
        amountDue: amountDueNow(payload.bookingType, payload.level),
        paymentDeadline: paymentDeadline(now),
      },
      packageId,
    );
    if (result.ok) return result.booking;
    if (result.conflict === "slot") throw slotTakenError();
  }
  throw new Error("[bookings] could not allocate a unique payment reference");
}

async function createPackage(payload: CreateBookingInput): Promise<PrivatePackage> {
  for (let attempt = 0; attempt < PAYMENT_REFERENCE_ATTEMPTS; attempt += 1) {
    const created = await insertPackage({
      packageCode: generatePackageCode(randomInt),
      level: payload.level,
      sessionsTotal: PRIVATE_PACKAGES[payload.level].sessions,
      amountPaid: amountDueNow("PRIVATE", payload.level),
      studentName: payload.studentName,
      whatsappNumber: payload.whatsappNumber!,
      whatsappGroupName: payload.whatsappGroupName,
    });
    if (created) return created;
  }
  throw new Error("[bookings] could not allocate a unique package code");
}

/** A session from an already paid package: no QRIS step, booked as paid. */
async function createPackageBooking(
  payload: CreateBookingInput & { packageCode: string; whatsappNumber: string },
): Promise<Booking> {
  const result = await bookWithPackage(payload);
  if (!result.ok) {
    if (result.reason === "slot") throw slotTakenError();
    throw packageError(result.reason);
  }
  const booking = await findBookingById(result.bookingId);
  if (!booking) throw new Error("[bookings] package booking vanished after insert");
  return booking;
}

function packageError(
  code: "PACKAGE_NOT_FOUND" | "PACKAGE_NOT_CONFIRMED" | "PACKAGE_USED_UP",
): BookingError {
  const messages = {
    PACKAGE_NOT_FOUND: "No package matches that code and WhatsApp number.",
    PACKAGE_NOT_CONFIRMED: "This package has not been confirmed by the admin yet.",
    PACKAGE_USED_UP: "Every session in this package has been used.",
  } as const;
  return new BookingError(code, messages[code], { packageCode: messages[code] });
}

/**
 * Public: a student checks their package before booking the next session.
 * Both the code and the WhatsApp number must match, so a leaked code alone
 * is not enough.
 */
export async function lookupPackage(input: unknown): Promise<PackageLookup> {
  const parsed = packageLookupSchema.safeParse(input);
  if (!parsed.success) {
    throw new BookingError(
      "VALIDATION_FAILED",
      "Please correct the highlighted fields.",
      toFieldErrors(parsed.error),
    );
  }
  const pkg = await findPackageByCode(
    parsed.data.packageCode as string,
    parsed.data.whatsappNumber as string,
  );
  if (!pkg) throw packageError("PACKAGE_NOT_FOUND");
  if (pkg.status !== "CONFIRMED") throw packageError("PACKAGE_NOT_CONFIRMED");
  if (pkg.sessionsUsed >= pkg.sessionsTotal) throw packageError("PACKAGE_USED_UP");

  return {
    packageCode: pkg.packageCode,
    level: pkg.level,
    sessionsTotal: pkg.sessionsTotal,
    sessionsUsed: pkg.sessionsUsed,
    status: pkg.status,
    studentName: pkg.studentName,
    whatsappGroupName: pkg.whatsappGroupName,
  };
}

/** Admin listing of every private package. */
export async function listPackages(): Promise<PrivatePackage[]> {
  return findPackages();
}

const PAYMENT_REFERENCE_ATTEMPTS = 8;

/**
 * Public: the student reports that they transferred the money. Idempotent —
 * reporting twice returns the same booking instead of an error, so a double
 * click or a retried request can never cause trouble.
 */
export async function markBookingPaid(
  id: string,
  input: unknown,
  now: Date = new Date(),
): Promise<Booking> {
  const parsed = markPaidSchema.safeParse(input);
  if (!parsed.success) {
    throw new BookingError(
      "VALIDATION_FAILED",
      "Please correct the highlighted fields.",
      toFieldErrors(parsed.error),
    );
  }
  const { paymentCode, payerName } = parsed.data;

  await expireFinishedBookings(now);

  const paid = await markBookingPaidById(id, paymentCode, payerName, now);
  if (paid) {
    if (!paid.packageId) return paid;
    await advancePackageStatus(paid.packageId, "PENDING");
    return (await findBookingById(id)) ?? paid;
  }

  const booking = await findBookingById(id);
  if (!booking || booking.paymentCode !== paymentCode) {
    throw new BookingError("NOT_FOUND", "That booking no longer exists.");
  }
  if (booking.paymentStatus !== "UNPAID" && booking.status !== "CANCELLED") {
    return booking;
  }
  throw new BookingError(
    "PAYMENT_EXPIRED",
    "The payment window has closed and the slot was released.",
  );
}

function slotTakenError(): BookingError {
  return new BookingError(
    "SLOT_TAKEN",
    "Someone just booked that slot. Please pick another time.",
    { timeSlot: "This slot has just been taken." },
  );
}

/**
 * Loads a booking or throws. Shared by every admin operation so a missing id
 * always produces the same 404.
 */
async function requireBooking(id: string): Promise<Booking> {
  const booking = await findBookingById(id);
  if (!booking) {
    throw new BookingError("NOT_FOUND", "That booking no longer exists.");
  }
  return booking;
}

/** Cancels a booking and releases its slot. Cancelling twice is rejected. */
export async function cancelBooking(
  id: string,
  now: Date = new Date(),
): Promise<Booking> {
  await expireFinishedBookings(now);
  const booking = await requireBooking(id);

  if (booking.status === "CANCELLED") {
    throw new BookingError(
      "ALREADY_CANCELLED",
      "That booking is already cancelled.",
    );
  }

  const cancelled = await cancelBookingById(id);
  if (!cancelled)
    throw new BookingError("NOT_FOUND", "That booking no longer exists.");
  if (!cancelled.packageId) return cancelled;

  // Give the session back to the package (or void an unpaid one).
  await releasePackageSession(cancelled.packageId);
  return (await findBookingById(id)) ?? cancelled;
}

/**
 * Moves a booking to a different date and slot. The target must satisfy every
 * rule a new booking would, and the move is atomic: if another booking claims
 * the slot first, the partial UNIQUE index rejects the update.
 */
export async function rescheduleBooking(
  id: string,
  target: { date: IsoDate; timeSlot: TimeSlotId },
  now: Date = new Date(),
): Promise<Booking> {
  await expireFinishedBookings(now);
  const booking = await requireBooking(id);

  if (booking.status === "CANCELLED") {
    throw new BookingError(
      "ALREADY_CANCELLED",
      "A cancelled booking cannot be moved. Create a new booking instead.",
    );
  }

  if (booking.date === target.date && booking.timeSlot === target.timeSlot) {
    throw new BookingError(
      "UNCHANGED",
      "That booking is already at this date and time.",
      {
        timeSlot: "Choose a different date or time.",
      },
    );
  }

  assertBookableDate(target.date, now);
  await assertDayOpen(target.date);

  const slot = TIME_SLOTS.find(
    (candidate) => candidate.id === target.timeSlot,
  )!;
  if (isSlotPast(target.date, slot, now)) {
    throw new BookingError(
      "SLOT_EXPIRED",
      "That time slot has already passed.",
      {
        timeSlot: "That time slot has already passed.",
      },
    );
  }

  const taken = (await findOccupyingBookingsByDate(target.date)).some(
    (other) => other.timeSlot === target.timeSlot && other.id !== id,
  );
  if (taken) throw slotTakenError();

  const moved = await rescheduleBookingById(id, target.date, target.timeSlot);
  if (!moved) throw slotTakenError();
  return moved;
}

export async function confirmBookingPayment(id: string): Promise<Booking> {
  const booking = await requireBooking(id);
  if (booking.paymentStatus === "CONFIRMED") {
    throw new BookingError(
      "ALREADY_CONFIRMED",
      "The payment has already been confirmed.",
    );
  }

  const confirmed = await confirmBookingPaymentById(id);
  if (confirmed) {
    if (!confirmed.packageId) return confirmed;
    // Confirming the booking that bought a package activates the package code.
    await advancePackageStatus(confirmed.packageId, "CONFIRMED");
    return (await findBookingById(id)) ?? confirmed;
  }

  const current = await requireBooking(id);
  if (current.paymentStatus === "CONFIRMED") {
    throw new BookingError(
      "ALREADY_CONFIRMED",
      "The payment has already been confirmed.",
    );
  }
  throw new BookingError("NOT_FOUND", "That booking no longer exists.");
}

/** Parses an untrusted admin action payload and applies it. */
export async function applyBookingAction(
  id: string,
  input: unknown,
  now: Date = new Date(),
): Promise<Booking> {
  const action = parseBookingAction(input);
  if (action.action === "cancel") return cancelBooking(id, now);
  if (action.action === "confirm-payment") return confirmBookingPayment(id);
  return rescheduleBooking(
        id,
        { date: action.date, timeSlot: action.timeSlot as TimeSlotId },
        now,
      );
}

/** Admin listing with server-side filters applied. */
export async function listBookings(
  filters: BookingFilters = {},
  now: Date = new Date(),
): Promise<Booking[]> {
  await expireFinishedBookings(now);
  return findBookings(filters);
}

/** Closed days from today onwards, for the admin dashboard. */
export async function listClosedDays(now: Date = new Date()): Promise<ClosedDate[]> {
  return findClosedDates(todayInZone(now));
}

/**
 * Closes a weekday for everyone. Weekends are always closed and past days
 * cannot change. Refused while any student holds a slot on that day, even
 * one still waiting for payment or confirmation.
 */
export async function closeDay(input: unknown, now: Date = new Date()): Promise<ClosedDate[]> {
  const parsed = closeDaySchema.safeParse(input);
  if (!parsed.success) {
    throw new BookingError(
      "VALIDATION_FAILED",
      "Please correct the highlighted fields.",
      toFieldErrors(parsed.error),
    );
  }
  const { date, reason } = parsed.data;
  if (isWeekend(date)) {
    throw new BookingError("WEEKEND", "Weekends are already closed.", {
      date: "Weekends are already closed.",
    });
  }
  if (date < todayInZone(now)) {
    throw new BookingError("PAST_DATE", "That date has already passed.", {
      date: "That date has already passed.",
    });
  }

  // Unpaid holds that ran out must not block the admin.
  await expireFinishedBookings(now);
  await closeDate(date, reason ?? null);
  return listClosedDays(now);
}

/** Opens a closed day again so students can book it. */
export async function reopenDay(date: string, now: Date = new Date()): Promise<ClosedDate[]> {
  if (!isValidIsoDate(date)) {
    throw new BookingError("VALIDATION_FAILED", "Choose a valid date.", {
      date: "Choose a valid date.",
    });
  }
  if (!(await reopenDate(date))) {
    throw new BookingError("NOT_FOUND", "That day is not closed.");
  }
  return listClosedDays(now);
}

export { findBookingById } from "./repository";
