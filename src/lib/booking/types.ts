import type {
  BOOKING_RECORD_STATUSES,
  BOOKING_STATUSES,
  CLASS_LEVELS,
  TIME_SLOTS,
} from "./constants";

/** `"A1" | "A2" | "B1"` — B2 is intentionally not part of the union. */
export type ClassLevel = (typeof CLASS_LEVELS)[number];

/** Identifier of a fixed time slot, e.g. `"10:00-11:30"`. */
export type TimeSlotId = (typeof TIME_SLOTS)[number]["id"];

export type TimeSlot = (typeof TIME_SLOTS)[number];

/**
 * `AVAILABLE` only ever describes a *slot*. A persisted booking starts as
 * `BOOKED`, becomes `EXPIRED` once its class has finished, or `CANCELLED` if
 * an admin cancels it — which releases the slot for someone else.
 */
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

/** The subset of {@link BookingStatus} a stored booking can hold. */
export type BookingRecordStatus = (typeof BOOKING_RECORD_STATUSES)[number];

/** A calendar date in {@link import("./constants").TIMEZONE}, formatted `YYYY-MM-DD`. */
export type IsoDate = string;

export interface Booking {
  id: string;
  studentName: string;
  whatsappGroupName: string;
  lastMaterial: string;
  level: ClassLevel;
  date: IsoDate;
  timeSlot: TimeSlotId;
  status: BookingRecordStatus;
  createdAt: string;
  updatedAt: string;
}

/** Payload accepted by the booking service once it has been validated. */
export interface CreateBookingInput {
  studentName: string;
  whatsappGroupName: string;
  lastMaterial: string;
  level: ClassLevel;
  date: IsoDate;
  timeSlot: TimeSlotId;
}

/** Payload for moving an existing booking to a different date and slot. */
export interface RescheduleBookingInput {
  date: IsoDate;
  timeSlot: TimeSlotId;
}

/** One time slot on one date, resolved against existing bookings and "now". */
export interface SlotAvailability {
  timeSlot: TimeSlotId;
  start: string;
  end: string;
  status: BookingStatus;
  /** Level occupying the slot when `status === "BOOKED"`. */
  bookedLevel: ClassLevel | null;
  /** Human-readable explanation, used for the accessible label of the slot. */
  reason: string;
}

export interface DayAvailability {
  date: IsoDate;
  isOpen: boolean;
  /** Why the whole day is closed (weekend / past / outside booking window). */
  closedReason: string | null;
  slots: SlotAvailability[];
}

/** One selectable day in the date picker. */
export interface CalendarDay {
  date: IsoDate;
  weekdayShort: string;
  dayOfMonth: string;
  monthShort: string;
  isWeekend: boolean;
  isToday: boolean;
  selectable: boolean;
  availableSlots: number;
  totalSlots: number;
}

export interface BookingFilters {
  date?: IsoDate;
  level?: ClassLevel;
  status?: BookingRecordStatus;
}
