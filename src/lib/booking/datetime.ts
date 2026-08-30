import {
  BOOKING_WINDOW_DAYS,
  OPEN_WEEKDAYS,
  TIMEZONE,
  TIME_SLOTS,
} from "./constants";
import type { IsoDate, TimeSlot, TimeSlotId } from "./types";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const partsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** Wall-clock date and time in {@link TIMEZONE} for the given instant. */
function zonedParts(instant: Date): { date: IsoDate; minutes: number } {
  const parts = partsFormatter.formatToParts(instant);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "00";
  // `hour12: false` can yield "24" for midnight in some engines.
  const hour = Number(get("hour")) % 24;
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: hour * 60 + Number(get("minute")),
  };
}

/** Today's calendar date in {@link TIMEZONE}. */
export function todayInZone(now: Date = new Date()): IsoDate {
  return zonedParts(now).date;
}

/** Minutes elapsed since midnight in {@link TIMEZONE}. */
export function minutesOfDayInZone(now: Date = new Date()): number {
  return zonedParts(now).minutes;
}

export function isValidIsoDate(value: unknown): value is IsoDate {
  if (typeof value !== "string" || !ISO_DATE_PATTERN.test(value)) return false;
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  if (Number.isNaN(timestamp)) return false;
  // Rejects overflow such as 2026-02-31, which `Date.parse` silently rolls over.
  return new Date(timestamp).toISOString().slice(0, 10) === value;
}

/** Day of week for an ISO date, 0 = Sunday … 6 = Saturday. */
export function weekdayOf(date: IsoDate): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

export function isWeekend(date: IsoDate): boolean {
  return !(OPEN_WEEKDAYS as readonly number[]).includes(weekdayOf(date));
}

/** `date` shifted by `days`, staying in ISO form. */
export function addDays(date: IsoDate, days: number): IsoDate {
  const shifted = new Date(`${date}T00:00:00Z`);
  shifted.setUTCDate(shifted.getUTCDate() + days);
  return shifted.toISOString().slice(0, 10);
}

/** Negative when `a` is earlier than `b`. ISO dates compare lexicographically. */
export function compareDates(a: IsoDate, b: IsoDate): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function findTimeSlot(id: string): TimeSlot | undefined {
  return TIME_SLOTS.find((slot) => slot.id === id);
}

export function isValidTimeSlot(id: unknown): id is TimeSlotId {
  return typeof id === "string" && findTimeSlot(id) !== undefined;
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * A slot is expired once its class has *finished*, so a lesson already in
 * progress is never offered but also never disappears from the day mid-class.
 */
export function isSlotPast(
  date: IsoDate,
  slot: TimeSlot,
  now: Date = new Date(),
): boolean {
  const today = todayInZone(now);
  if (date < today) return true;
  if (date > today) return false;
  return minutesOfDayInZone(now) >= toMinutes(slot.end);
}

/** The last date students may book, inclusive. */
export function lastBookableDate(now: Date = new Date()): IsoDate {
  return addDays(todayInZone(now), BOOKING_WINDOW_DAYS);
}

/** All dates offered by the picker, including closed ones (weekends are shown greyed out). */
export function bookingWindowDates(now: Date = new Date()): IsoDate[] {
  const start = todayInZone(now);
  return Array.from({ length: BOOKING_WINDOW_DAYS + 1 }, (_, index) =>
    addDays(start, index),
  );
}

/**
 * Every formatter below takes a plain BCP-47 tag (e.g. `"en-GB"`, `"de-DE"`)
 * rather than importing the app's `Locale` type, so this module stays a
 * dependency-free date utility usable from anywhere — the i18n layer maps
 * its own `Locale` to a tag via `intlTag()` before calling in.
 */
const DEFAULT_INTL_TAG = "en-GB";

/** e.g. `"Monday, 31 August 2026"` (en-GB) / `"Montag, 31. August 2026"` (de-DE). */
export function formatLongDate(date: IsoDate, tag: string = DEFAULT_INTL_TAG): string {
  return new Intl.DateTimeFormat(tag, {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00Z`));
}

/** e.g. `"Mon, 31 Aug"` (en-GB) / `"Mo., 31. Aug."` (de-DE). */
export function formatShortDate(date: IsoDate, tag: string = DEFAULT_INTL_TAG): string {
  return new Intl.DateTimeFormat(tag, {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(`${date}T00:00:00Z`));
}

/** e.g. `"Mon"` / `"Mo."` — used by the compact date-picker cells. */
export function formatWeekdayShort(date: IsoDate, tag: string = DEFAULT_INTL_TAG): string {
  return new Intl.DateTimeFormat(tag, { timeZone: "UTC", weekday: "short" }).format(
    new Date(`${date}T00:00:00Z`),
  );
}

/** e.g. `"Aug"` / `"Aug."` — used by the compact date-picker cells. */
export function formatMonthShort(date: IsoDate, tag: string = DEFAULT_INTL_TAG): string {
  return new Intl.DateTimeFormat(tag, { timeZone: "UTC", month: "short" }).format(
    new Date(`${date}T00:00:00Z`),
  );
}

/** e.g. `"26/08/2026, 14:30:00"` — used for the admin "created/updated" timestamps. */
export function formatDateTime(isoInstant: string, tag: string = DEFAULT_INTL_TAG): string {
  return new Date(isoInstant).toLocaleString(tag);
}

export function formatSlotRange(slot: TimeSlot): string {
  return `${slot.start}–${slot.end}`;
}
