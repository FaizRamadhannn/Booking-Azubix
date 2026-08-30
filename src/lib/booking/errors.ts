/** Machine-readable reasons a booking can be rejected. */
export const BOOKING_ERROR_CODES = [
  "VALIDATION_FAILED",
  "PAST_DATE",
  "WEEKEND",
  "OUTSIDE_BOOKING_WINDOW",
  "SLOT_EXPIRED",
  "SLOT_TAKEN",
  "NOT_FOUND",
  "ALREADY_CANCELLED",
  "UNCHANGED",
  "UNAUTHORIZED",
  "INTERNAL",
] as const;

export type BookingErrorCode = (typeof BOOKING_ERROR_CODES)[number];

const STATUS_BY_CODE: Record<BookingErrorCode, number> = {
  VALIDATION_FAILED: 400,
  PAST_DATE: 400,
  WEEKEND: 400,
  OUTSIDE_BOOKING_WINDOW: 400,
  SLOT_EXPIRED: 409,
  SLOT_TAKEN: 409,
  NOT_FOUND: 404,
  ALREADY_CANCELLED: 409,
  UNCHANGED: 400,
  UNAUTHORIZED: 401,
  INTERNAL: 500,
};

export class BookingError extends Error {
  readonly code: BookingErrorCode;
  /** Per-field messages, keyed by the field name used in the form. */
  readonly fieldErrors: Record<string, string>;

  constructor(
    code: BookingErrorCode,
    message: string,
    fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = "BookingError";
    this.code = code;
    this.fieldErrors = fieldErrors;
  }

  get httpStatus(): number {
    return STATUS_BY_CODE[this.code];
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      fieldErrors: this.fieldErrors,
    };
  }
}

export interface BookingErrorBody {
  code: BookingErrorCode;
  message: string;
  fieldErrors: Record<string, string>;
}
