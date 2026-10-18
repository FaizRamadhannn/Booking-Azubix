import {
  PAYMENT_CODE_ALPHABET,
  PAYMENT_CODE_LENGTH,
  PAYMENT_CODE_PREFIX,
  PAYMENT_HOLD_MINUTES,
} from "./constants";

/** Returns an integer in `[0, max)`. Injected so the helpers stay pure and testable. */
export type RandomInt = (max: number) => number;

/** Human-readable payment reference, e.g. `AZB-7F3K2Q`. No 0/O or 1/I/L to misread. */
export function generatePaymentCode(randomInt: RandomInt): string {
  let code = "";
  for (let i = 0; i < PAYMENT_CODE_LENGTH; i += 1) {
    code += PAYMENT_CODE_ALPHABET[randomInt(PAYMENT_CODE_ALPHABET.length)];
  }
  return `${PAYMENT_CODE_PREFIX}-${code}`;
}

/** When an unpaid hold stops reserving its slot. */
export function paymentDeadline(now: Date): Date {
  return new Date(now.getTime() + PAYMENT_HOLD_MINUTES * 60_000);
}

/** Whole seconds left before `deadline`, never negative. */
export function secondsLeft(deadline: string | Date, now: Date): number {
  const end = typeof deadline === "string" ? new Date(deadline) : deadline;
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 1000));
}
