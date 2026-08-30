import { z } from "zod";

import {
  BOOKING_RECORD_STATUSES,
  CLASS_LEVELS,
  FIELD_LIMITS,
  TIME_SLOT_IDS,
} from "./constants";
import {
  isValidIsoDate,
  isWeekend,
  lastBookableDate,
  todayInZone,
} from "./datetime";
import { BookingError } from "./errors";
import type { CreateBookingInput } from "./types";

const trimmed = (field: keyof typeof FIELD_LIMITS, label: string) =>
  z
    .string({ error: `${label} is required.` })
    .trim()
    .min(
      FIELD_LIMITS[field].min,
      `${label} must be at least ${FIELD_LIMITS[field].min} characters.`,
    )
    .max(
      FIELD_LIMITS[field].max,
      `${label} must be at most ${FIELD_LIMITS[field].max} characters.`,
    );

/**
 * Shape-level validation shared by the client form and the API route, so the
 * two can never drift apart. Calendar rules live in {@link assertBookableSlot}.
 */
export const createBookingSchema = z.object({
  studentName: trimmed("studentName", "Student name"),
  whatsappGroupName: trimmed("whatsappGroupName", "WhatsApp group name"),
  lastMaterial: trimmed("lastMaterial", "Last material"),
  level: z.enum(CLASS_LEVELS, { error: "Choose a class level." }),
  date: z
    .string({ error: "Choose a date." })
    .refine(isValidIsoDate, "Choose a valid date."),
  timeSlot: z.enum(TIME_SLOT_IDS as [string, ...string[]], {
    error: "Choose one of the available time slots.",
  }),
});

export type CreateBookingPayload = z.infer<typeof createBookingSchema>;

/** Only the calendar fields may change when an admin moves a booking. */
export const rescheduleBookingSchema = z.object({
  date: z
    .string({ error: "Choose a date." })
    .refine(isValidIsoDate, "Choose a valid date."),
  timeSlot: z.enum(TIME_SLOT_IDS as [string, ...string[]], {
    error: "Choose one of the available time slots.",
  }),
});

/** Discriminates the two admin operations on an existing booking. */
export const bookingActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("cancel") }),
  z
    .object({ action: z.literal("reschedule") })
    .extend(rescheduleBookingSchema.shape),
]);

export const bookingFiltersSchema = z.object({
  date: z.string().refine(isValidIsoDate, "Invalid date filter.").optional(),
  level: z.enum(CLASS_LEVELS).optional(),
  status: z.enum(BOOKING_RECORD_STATUSES).optional(),
});

/** Flattens a Zod issue list into the `{ field: message }` shape the form renders. */
export function toFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

/**
 * Parses untrusted input and throws a {@link BookingError} carrying per-field
 * messages. Never trust the caller — this runs on the server for every request.
 */
export function parseCreateBookingInput(input: unknown): CreateBookingInput {
  const result = createBookingSchema.safeParse(input);
  if (!result.success) {
    throw new BookingError(
      "VALIDATION_FAILED",
      "Please correct the highlighted fields.",
      toFieldErrors(result.error),
    );
  }
  return result.data as CreateBookingInput;
}

/**
 * Parses an admin cancel/reschedule request. Same contract as
 * {@link parseCreateBookingInput}: never trust the caller.
 */
export function parseBookingAction(input: unknown) {
  const result = bookingActionSchema.safeParse(input);
  if (!result.success) {
    throw new BookingError(
      "VALIDATION_FAILED",
      "Please correct the highlighted fields.",
      toFieldErrors(result.error),
    );
  }
  return result.data;
}

/**
 * Calendar-level rules: no past dates, no weekends, nothing beyond the booking
 * window. Slot-level expiry and collisions are resolved by the booking service.
 */
export function assertBookableDate(date: string, now: Date = new Date()): void {
  if (isWeekend(date)) {
    throw new BookingError(
      "WEEKEND",
      "Classes run Monday to Friday only. Please choose a weekday.",
      { date: "Classes run Monday to Friday only." },
    );
  }
  if (date < todayInZone(now)) {
    throw new BookingError("PAST_DATE", "That date has already passed.", {
      date: "That date has already passed.",
    });
  }
  const latest = lastBookableDate(now);
  if (date > latest) {
    throw new BookingError(
      "OUTSIDE_BOOKING_WINDOW",
      `Bookings are open up to ${latest} only.`,
      { date: `Bookings are open up to ${latest} only.` },
    );
  }
}
