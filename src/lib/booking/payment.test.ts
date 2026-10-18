import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { PAYMENT_CODE_ALPHABET } from "./constants";
import { generatePaymentCode, paymentDeadline, secondsLeft } from "./payment";

describe("payment references", () => {
  test("codes look like AZB-XXXXXX and avoid look-alike characters", () => {
    let n = 0;
    const code = generatePaymentCode((max) => n++ % max);
    assert.match(code, /^AZB-[A-Z2-9]{6}$/);
    for (const char of "01OIL") assert.ok(!PAYMENT_CODE_ALPHABET.includes(char));
  });

  test("an unpaid hold lasts five minutes", () => {
    const now = new Date("2026-10-18T03:00:00Z");
    assert.equal(paymentDeadline(now).toISOString(), "2026-10-18T03:05:00.000Z");
  });

  test("seconds left counts down and never goes negative", () => {
    const deadline = "2026-10-18T03:05:00.000Z";
    assert.equal(secondsLeft(deadline, new Date("2026-10-18T03:00:00Z")), 300);
    assert.equal(secondsLeft(deadline, new Date("2026-10-18T03:04:59.500Z")), 1);
    assert.equal(secondsLeft(deadline, new Date("2026-10-18T03:06:00Z")), 0);
  });
});
