import type {
  BOOKING_RECORD_STATUSES,
  BOOKING_STATUSES,
  BOOKING_TYPES,
  CLASS_LEVELS,
  PACKAGE_STATUSES,
  PAYMENT_STATUSES,
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

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export type PackageStatus = (typeof PACKAGE_STATUSES)[number];

/** `"REGULAR" | "PRIVATE"` — only regular classes are paid by QRIS. */
export type BookingType = (typeof BOOKING_TYPES)[number];

/** A calendar date in {@link import("./constants").TIMEZONE}, formatted `YYYY-MM-DD`. */
export type IsoDate = string;

export interface Booking {
  id: string;
  studentName: string;
  whatsappGroupName: string;
  lastMaterial: string;
  bookingType: BookingType;
  level: ClassLevel;
  date: IsoDate;
  timeSlot: TimeSlotId;
  status: BookingRecordStatus;
  price: number;
  paymentStatus: PaymentStatus;
  /** `AZB-XXXXXX`; null only on bookings made before payment references existed. */
  paymentCode: string | null;
  /** Exact amount to transfer: price plus the unique code. */
  amountDue: number;
  /** ISO timestamp; an `UNPAID` booking is released after this. */
  paymentDeadline: string | null;
  /** Name the transfer was made under, entered when the student reports payment. */
  payerName: string | null;
  /** Student's WhatsApp number (digits, with country code); required for private. */
  whatsappNumber: string | null;
  /** The private package this booking belongs to, if any. */
  packageId: string | null;
  privatePackage: BookingPackageInfo | null;
  createdAt: string;
  updatedAt: string;
}

/** What a booking shows about its private package. */
export interface BookingPackageInfo {
  packageCode: string;
  sessionsTotal: number;
  sessionsUsed: number;
  status: PackageStatus;
}

/** A private package as the admin sees it. */
export interface PrivatePackage extends BookingPackageInfo {
  id: string;
  level: ClassLevel;
  studentName: string;
  whatsappNumber: string;
  whatsappGroupName: string;
  amountPaid: number;
  createdAt: string;
  updatedAt: string;
}

/** What a student sees after entering their package code and WhatsApp number. */
export interface PackageLookup extends BookingPackageInfo {
  level: ClassLevel;
  studentName: string;
  whatsappGroupName: string;
}

/** Payload accepted by the booking service once it has been validated. */
export interface CreateBookingInput {
  studentName: string;
  whatsappGroupName: string;
  lastMaterial: string;
  bookingType: BookingType;
  level: ClassLevel;
  date: IsoDate;
  timeSlot: TimeSlotId;
  /** Normalised digits, e.g. 6281234567890. Required for private bookings. */
  whatsappNumber?: string;
  /** Set when a private booking is paid from an existing package. */
  packageCode?: string;
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
  /** Why the whole day is closed (weekend / past / outside window / day off). */
  closedReason: string | null;
  /** True when the admin closed this weekday. */
  dayOff: boolean;
  slots: SlotAvailability[];
}

/** One selectable day in the date picker. */
export interface CalendarDay {
  date: IsoDate;
  weekdayShort: string;
  dayOfMonth: string;
  monthShort: string;
  isWeekend: boolean;
  /** A weekday the admin closed: no classes at all. */
  isDayOff: boolean;
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

/** A weekday the admin closed, e.g. for a holiday. */
export interface ClosedDate {
  date: IsoDate;
  reason: string | null;
  createdAt: string;
}
