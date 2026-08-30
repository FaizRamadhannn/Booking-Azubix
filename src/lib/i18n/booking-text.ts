import { BOOKING_WINDOW_DAYS } from "@/lib/booking/constants";
import {
  formatShortDate,
  isWeekend,
  lastBookableDate,
  todayInZone,
} from "@/lib/booking/datetime";
import type { ClassLevel, IsoDate, SlotAvailability } from "@/lib/booking/types";

import type { Dictionary } from "./dictionaries/en";
import { format } from "./get-dictionary";
import { intlTag, type Locale } from "./locale";

/**
 * The server sends `slot.reason` / `DayAvailability.closedReason` as English
 * prose (see `src/lib/booking/service.ts`), which this app never displays —
 * the client reconstructs the same wording in the active language from the
 * raw fields (`status`, `bookedLevel`, `date`) using these helpers, so the
 * server itself never needs to know the visitor's language.
 */

export function getSlotReason(
  dict: Dictionary,
  status: SlotAvailability["status"],
  bookedLevel: ClassLevel | null,
): string {
  const t = dict.booking.time.reasons;
  if (status === "EXPIRED") return t.expired;
  if (status === "BOOKED") return format(t.bookedForLevel, { level: bookedLevel ?? "" });
  return t.available;
}

/** Mirrors `closedReasonFor()` in service.ts, purely on the client. */
export function getClosedReason(
  dict: Dictionary,
  locale: Locale,
  date: IsoDate,
  now: Date = new Date(),
): string | null {
  if (isWeekend(date)) return dict.booking.date.closedWeekend;
  if (date < todayInZone(now)) return dict.booking.date.closedPast;
  const latest = lastBookableDate(now);
  if (date > latest) {
    return format(dict.booking.date.closedOutsideWindow, {
      days: BOOKING_WINDOW_DAYS,
      date: formatShortDate(latest, intlTag(locale)),
    });
  }
  return null;
}
