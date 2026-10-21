import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { BookingError } from "./errors";
import { generatePackageCode } from "./payment";
import {
  normalizeWhatsappNumber,
  packageLookupSchema,
  parseCreateBookingInput,
} from "./validation";

const PRIVATE = {
  studentName: "Azam",
  whatsappGroupName: "Deutsch A1 Pagi",
  lastMaterial: "Lektion 3 - Perfekt",
  bookingType: "PRIVATE",
  level: "A1",
  date: "2026-08-31",
  timeSlot: "10:00-11:30",
};

function rejectedFields(input: unknown): Record<string, string> {
  try {
    parseCreateBookingInput(input);
  } catch (error) {
    assert.ok(error instanceof BookingError);
    return error.fieldErrors;
  }
  throw new Error("expected the input to be rejected");
}

describe("normalizeWhatsappNumber", () => {
  test("turns local and formatted Indonesian numbers into wa.me digits", () => {
    assert.equal(normalizeWhatsappNumber("0812-3456-7890"), "6281234567890");
    assert.equal(normalizeWhatsappNumber("+62 812 3456 7890"), "6281234567890");
    assert.equal(normalizeWhatsappNumber("6281234567890"), "6281234567890");
    assert.equal(normalizeWhatsappNumber("(0812) 3456.7890"), "6281234567890");
  });

  test("keeps foreign numbers with their own country code", () => {
    assert.equal(normalizeWhatsappNumber("+49 151 2345 6789"), "4915123456789");
    assert.equal(normalizeWhatsappNumber("0049 151 2345 6789"), "4915123456789");
  });

  test("rejects text, too short and too long numbers", () => {
    assert.equal(normalizeWhatsappNumber("call me"), null);
    assert.equal(normalizeWhatsappNumber("0812"), null);
    assert.equal(normalizeWhatsappNumber("0812345678901234567"), null);
    assert.equal(normalizeWhatsappNumber(""), null);
  });
});

describe("private booking validation", () => {
  test("a private booking needs a WhatsApp number", () => {
    assert.ok(rejectedFields(PRIVATE).whatsappNumber);
    assert.ok(rejectedFields({ ...PRIVATE, whatsappNumber: "  " }).whatsappNumber);
  });

  test("the WhatsApp number is stored normalised", () => {
    const parsed = parseCreateBookingInput({ ...PRIVATE, whatsappNumber: "0812 3456 7890" });
    assert.equal(parsed.whatsappNumber, "6281234567890");
    assert.equal(parsed.packageCode, undefined);
  });

  test("a regular booking does not need a WhatsApp number", () => {
    const parsed = parseCreateBookingInput({
      ...PRIVATE,
      bookingType: "REGULAR",
      whatsappNumber: "",
    });
    assert.equal(parsed.whatsappNumber, undefined);
  });

  test("package codes are upper-cased and only allowed for private", () => {
    const parsed = parseCreateBookingInput({
      ...PRIVATE,
      whatsappNumber: "081234567890",
      packageCode: " pkg-7f3k2q ",
    });
    assert.equal(parsed.packageCode, "PKG-7F3K2Q");

    assert.ok(
      rejectedFields({ ...PRIVATE, bookingType: "REGULAR", packageCode: "PKG-7F3K2Q" })
        .packageCode,
    );
    assert.ok(
      rejectedFields({ ...PRIVATE, whatsappNumber: "081234567890", packageCode: "nope" })
        .packageCode,
    );
  });
});

describe("package lookup", () => {
  test("needs both the code and the WhatsApp number", () => {
    assert.equal(packageLookupSchema.safeParse({ packageCode: "PKG-7F3K2Q" }).success, false);
    assert.equal(
      packageLookupSchema.safeParse({ packageCode: "", whatsappNumber: "081234567890" }).success,
      false,
    );
    const ok = packageLookupSchema.safeParse({
      packageCode: "pkg-7f3k2q",
      whatsappNumber: "0812 3456 7890",
    });
    assert.ok(ok.success);
    assert.deepEqual(ok.data, { packageCode: "PKG-7F3K2Q", whatsappNumber: "6281234567890" });
  });

  test("package codes look like PKG-XXXXXX", () => {
    let n = 0;
    assert.match(generatePackageCode((max) => n++ % max), /^PKG-[A-Z2-9]{6}$/);
  });
});
