import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  BOOKING_RECORD_STATUSES,
  BOOKING_STATUSES,
  SLOT_RELEASING_STATUSES,
} from "./constants";
import { BookingError } from "./errors";
import {
  assertBookableDate,
  parseBookingAction,
  parseCreateBookingInput,
} from "./validation";

const VALID = {
  studentName: "Azam",
  whatsappGroupName: "Deutsch A1 Pagi",
  lastMaterial: "Lektion 3 - Perfekt",
  level: "A1",
  date: "2026-08-31",
  timeSlot: "10:00-11:30",
};

function expectRejection(input: unknown, field?: string): BookingError {
  try {
    parseCreateBookingInput(input);
  } catch (error) {
    assert.ok(error instanceof BookingError);
    assert.equal(error.code, "VALIDATION_FAILED");
    if (field)
      assert.ok(error.fieldErrors[field], `expected an error on "${field}"`);
    return error;
  }
  throw new Error("expected the input to be rejected");
}

describe("parseCreateBookingInput", () => {
  test("accepts a well-formed booking and trims whitespace", () => {
    const parsed = parseCreateBookingInput({
      ...VALID,
      studentName: "  Azam  ",
    });
    assert.equal(parsed.studentName, "Azam");
    assert.equal(parsed.level, "A1");
  });

  test("rejects B2 and any other unknown level", () => {
    expectRejection({ ...VALID, level: "B2" }, "level");
    expectRejection({ ...VALID, level: "C1" }, "level");
    expectRejection({ ...VALID, level: "" }, "level");
  });

  test("rejects blank required fields", () => {
    expectRejection({ ...VALID, studentName: "   " }, "studentName");
    expectRejection({ ...VALID, whatsappGroupName: "" }, "whatsappGroupName");
    expectRejection({ ...VALID, lastMaterial: "" }, "lastMaterial");
    expectRejection({}, "studentName");
  });

  test("rejects over-long fields", () => {
    expectRejection({ ...VALID, studentName: "a".repeat(200) }, "studentName");
  });

  test("rejects invalid dates and slots students cannot invent", () => {
    expectRejection({ ...VALID, date: "2026-02-31" }, "date");
    expectRejection({ ...VALID, date: "tomorrow" }, "date");
    expectRejection({ ...VALID, timeSlot: "09:00-10:00" }, "timeSlot");
    expectRejection({ ...VALID, timeSlot: "" }, "timeSlot");
  });

  test("rejects non-object payloads", () => {
    expectRejection(null);
    expectRejection("a string");
  });
});

describe("assertBookableDate", () => {
  const now = new Date("2026-08-26T05:00:00Z"); // 12:00 WIB, Wednesday

  test("accepts an upcoming weekday", () => {
    assert.doesNotThrow(() => assertBookableDate("2026-08-31", now));
    assert.doesNotThrow(() => assertBookableDate("2026-08-26", now));
  });

  test("rejects weekends", () => {
    for (const date of ["2026-08-29", "2026-08-30"]) {
      assert.throws(
        () => assertBookableDate(date, now),
        (error: unknown) =>
          error instanceof BookingError && error.code === "WEEKEND",
      );
    }
  });

  test("rejects past dates", () => {
    assert.throws(
      () => assertBookableDate("2026-08-25", now),
      (error: unknown) =>
        error instanceof BookingError && error.code === "PAST_DATE",
    );
  });

  test("rejects dates beyond the booking window", () => {
    assert.throws(
      () => assertBookableDate("2027-01-04", now),
      (error: unknown) =>
        error instanceof BookingError &&
        error.code === "OUTSIDE_BOOKING_WINDOW",
    );
  });
});

describe("BookingError", () => {
  test("maps codes to HTTP statuses", () => {
    assert.equal(new BookingError("VALIDATION_FAILED", "x").httpStatus, 400);
    assert.equal(new BookingError("SLOT_TAKEN", "x").httpStatus, 409);
    assert.equal(new BookingError("SLOT_EXPIRED", "x").httpStatus, 409);
    assert.equal(new BookingError("INTERNAL", "x").httpStatus, 500);
  });
});

describe("parseBookingAction", () => {
  test("accepts a cancel action", () => {
    assert.deepEqual(parseBookingAction({ action: "cancel" }), {
      action: "cancel",
    });
  });

  test("accepts a reschedule action with a date and slot", () => {
    assert.deepEqual(
      parseBookingAction({
        action: "reschedule",
        date: "2026-08-31",
        timeSlot: "12:00-13:30",
      }),
      { action: "reschedule", date: "2026-08-31", timeSlot: "12:00-13:30" },
    );
  });

  test("rejects an unknown action", () => {
    assert.throws(
      () => parseBookingAction({ action: "delete" }),
      (error: unknown) =>
        error instanceof BookingError && error.code === "VALIDATION_FAILED",
    );
  });

  test("rejects a reschedule that is missing or malformed", () => {
    for (const payload of [
      { action: "reschedule" },
      { action: "reschedule", date: "2026-08-31" },
      { action: "reschedule", date: "2026-02-31", timeSlot: "12:00-13:30" },
      { action: "reschedule", date: "2026-08-31", timeSlot: "09:00-10:00" },
    ]) {
      assert.throws(
        () => parseBookingAction(payload),
        (error: unknown) =>
          error instanceof BookingError && error.code === "VALIDATION_FAILED",
      );
    }
  });

  test("ignores extra fields a caller tries to smuggle in", () => {
    const parsed = parseBookingAction({
      action: "cancel",
      status: "BOOKED",
      studentName: "someone else",
    });
    assert.deepEqual(parsed, { action: "cancel" });
  });
});

describe("record statuses", () => {
  test("cancelled is a stored status but never a slot status on its own", () => {
    assert.deepEqual(
      [...BOOKING_RECORD_STATUSES],
      ["BOOKED", "EXPIRED", "CANCELLED"],
    );
    assert.ok((BOOKING_STATUSES as readonly string[]).includes("AVAILABLE"));
  });

  test("only cancellation releases a slot", () => {
    assert.deepEqual([...SLOT_RELEASING_STATUSES], ["CANCELLED"]);
  });
});
