import "server-only";

import { BOOKING_WINDOW_DAYS, TIME_SLOTS } from "./constants";
import {
  bookingWindowDates,
  formatShortDate,
  isSlotPast,
  isWeekend,
  lastBookableDate,
  todayInZone,
} from "./datetime";
import { BookingError } from "./errors";
import {
  cancelBookingById,
  expireFinishedBookings,
  findBookingById,
  findBookings,
  findOccupyingBookingsBetween,
  findOccupyingBookingsByDate,
  insertBooking,
  rescheduleBookingById,
} from "./repository";
import type {
  Booking,
  BookingFilters,
  CalendarDay,
  DayAvailability,
  IsoDate,
  SlotAvailability,
  TimeSlotId,
} from "./types";
import {
  assertBookableDate,
  parseBookingAction,
  parseCreateBookingInput,
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

/** Why the whole day cannot be booked, or `null` when it is open. */
function closedReasonFor(date: IsoDate, now: Date): string | null {
  if (isWeekend(date)) return "Classes run Monday to Friday only.";
  if (date < todayInZone(now)) return "This date has already passed.";
  if (date > lastBookableDate(now)) {
    return `Bookings open ${BOOKING_WINDOW_DAYS} days ahead, up to ${formatShortDate(lastBookableDate(now))}.`;
  }
  return null;
}

/** Slot-by-slot availability for one date. */
export async function getDayAvailability(
  date: IsoDate,
  now: Date = new Date(),
): Promise<DayAvailability> {
  await expireFinishedBookings(now);
  const closedReason = closedReasonFor(date, now);
  if (closedReason) {
    return { date, isOpen: false, closedReason, slots: [] };
  }
  return {
    date,
    isOpen: true,
    closedReason: null,
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
  const bookings = await findOccupyingBookingsBetween(
    dates[0],
    dates[dates.length - 1],
  );

  const bookedByDate = new Map<IsoDate, Set<string>>();
  for (const booking of bookings) {
    const set = bookedByDate.get(booking.date) ?? new Set<string>();
    set.add(booking.timeSlot);
    bookedByDate.set(booking.date, set);
  }

  return dates.map((date): CalendarDay => {
    const day = new Date(`${date}T00:00:00Z`);
    const weekend = isWeekend(date);
    const taken = bookedByDate.get(date) ?? new Set<string>();
    const availableSlots = weekend
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
      isToday: date === today,
      selectable: !weekend && availableSlots > 0,
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

  const booking = await insertBooking(payload);
  if (!booking) throw slotTakenError();
  return booking;
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
  return cancelled;
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

/** Parses an untrusted admin action payload and applies it. */
export async function applyBookingAction(
  id: string,
  input: unknown,
  now: Date = new Date(),
): Promise<Booking> {
  const action = parseBookingAction(input);
  return action.action === "cancel"
    ? cancelBooking(id, now)
    : rescheduleBooking(
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

export { findBookingById } from "./repository";
