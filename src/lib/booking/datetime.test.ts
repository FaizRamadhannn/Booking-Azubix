import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { CLASS_LEVELS, OPEN_WEEKDAYS, TIME_SLOTS } from "./constants";
import {
  addDays,
  findTimeSlot,
  isSlotPast,
  isValidIsoDate,
  isValidTimeSlot,
  isWeekend,
  minutesOfDayInZone,
  todayInZone,
  weekdayOf,
} from "./datetime";

describe("business constants", () => {
  test("only A1, A2 and B1 exist", () => {
    assert.deepEqual([...CLASS_LEVELS], ["A1", "A2", "B1"]);
    assert.ok(!(CLASS_LEVELS as readonly string[]).includes("B2"));
  });

  test("the six published slots are the only ones", () => {
    assert.deepEqual(
      TIME_SLOTS.map((slot) => slot.id),
      [
        "10:00-11:30",
        "12:00-13:30",
        "13:30-15:00",
        "15:00-16:30",
        "16:30-18:00",
        "18:00-19:30",
      ],
    );
  });

  test("classes run Monday to Friday", () => {
    assert.deepEqual([...OPEN_WEEKDAYS], [1, 2, 3, 4, 5]);
  });
});

describe("isValidIsoDate", () => {
  test("accepts well-formed calendar dates", () => {
    assert.ok(isValidIsoDate("2026-08-31"));
    assert.ok(isValidIsoDate("2028-02-29"));
  });

  test("rejects dates that roll over, malformed input and non-strings", () => {
    for (const value of [
      "2026-02-31",
      "2027-02-29",
      "2026-13-01",
      "2026-8-3",
      "not-a-date",
      "",
      20260831,
      null,
      undefined,
    ]) {
      assert.ok(
        !isValidIsoDate(value),
        `expected ${String(value)} to be rejected`,
      );
    }
  });
});

describe("weekday rules", () => {
  test("weekends are closed", () => {
    assert.equal(weekdayOf("2026-08-31"), 1);
    assert.ok(isWeekend("2026-08-29")); // Saturday
    assert.ok(isWeekend("2026-08-30")); // Sunday
    assert.ok(!isWeekend("2026-08-28")); // Friday
    assert.ok(!isWeekend("2026-08-31")); // Monday
  });

  test("addDays crosses month and leap-year boundaries", () => {
    assert.equal(addDays("2026-08-31", 1), "2026-09-01");
    assert.equal(addDays("2026-09-01", -1), "2026-08-31");
    assert.equal(addDays("2028-02-28", 1), "2028-02-29");
  });
});

describe("time slots", () => {
  test("only published slot ids resolve", () => {
    assert.equal(findTimeSlot("10:00-11:30")?.end, "11:30");
    assert.equal(findTimeSlot("09:00-10:00"), undefined);
    assert.ok(isValidTimeSlot("18:00-19:30"));
    assert.ok(!isValidTimeSlot("20:00-21:30"));
  });
});

describe("expiry is evaluated in Asia/Jakarta, not UTC", () => {
  const morning = findTimeSlot("10:00-11:30")!;
  const evening = findTimeSlot("18:00-19:30")!;

  test("a class in progress has not expired yet", () => {
    const during = new Date("2026-08-31T04:00:00Z"); // 11:00 WIB
    assert.ok(!isSlotPast("2026-08-31", morning, during));
    assert.ok(!isSlotPast("2026-08-31", evening, during));
  });

  test("a class expires the moment it ends", () => {
    const atEnd = new Date("2026-08-31T04:30:00Z"); // 11:30 WIB
    assert.ok(isSlotPast("2026-08-31", morning, atEnd));
  });

  test("earlier and later dates are resolved correctly", () => {
    const during = new Date("2026-08-31T04:00:00Z");
    assert.ok(isSlotPast("2026-08-30", morning, during));
    assert.ok(!isSlotPast("2026-09-01", morning, during));
  });

  test("late UTC evening is already the next day in WIB", () => {
    const beforeMidnightUtc = new Date("2026-08-30T23:30:00Z"); // 06:30 WIB, 31 Aug
    assert.equal(todayInZone(beforeMidnightUtc), "2026-08-31");
    assert.equal(minutesOfDayInZone(beforeMidnightUtc), 6 * 60 + 30);
    assert.ok(!isSlotPast("2026-08-31", morning, beforeMidnightUtc));
  });

  test("WIB midnight rolls the date over and expires the previous day", () => {
    const midnightWib = new Date("2026-08-31T17:00:00Z"); // 00:00 WIB, 1 Sep
    assert.equal(todayInZone(midnightWib), "2026-09-01");
    assert.equal(minutesOfDayInZone(midnightWib), 0);
    assert.ok(isSlotPast("2026-08-31", evening, midnightWib));
  });
});
