"use client";

import * as React from "react";
import Image from "next/image";
import { Loader2, Timer } from "lucide-react";

import qrisImage from "@/components/payment/Qris.webp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FIELD_LIMITS,
  PRIVATE_PACKAGE_EXTRAS,
  PRIVATE_PACKAGE_INCLUDES,
  PAYMENT_HOLD_MINUTES,
  PRIVATE_PACKAGES,
  privatePackageTotal,
} from "@/lib/booking/constants";
import { secondsLeft } from "@/lib/booking/payment";
import { findTimeSlot, formatLongDate } from "@/lib/booking/datetime";
import { format } from "@/lib/i18n/get-dictionary";
import { formatRupiah, formatWhatsappNumber } from "@/lib/utils";
import type { Booking } from "@/lib/booking/types";
import { useI18n } from "@/lib/i18n/i18n-context";
import { intlTag } from "@/lib/i18n/locale";

/** Seconds until the hold ends, ticking once a second; fires `onExpired` once at zero. */
function useCountdown(deadline: string | null, onExpired: () => void): number | null {
  const [left, setLeft] = React.useState(() =>
    deadline ? secondsLeft(deadline, new Date()) : null,
  );
  const expiredRef = React.useRef(onExpired);
  React.useEffect(() => {
    expiredRef.current = onExpired;
  });

  React.useEffect(() => {
    if (!deadline) return;
    const tick = () => {
      const next = secondsLeft(deadline, new Date());
      setLeft(next);
      if (next === 0) {
        window.clearInterval(id);
        expiredRef.current();
      }
    };
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [deadline]);

  return left;
}

function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function PaymentStep({
  booking,
  busy,
  onConfirm,
  onExpired,
}: {
  /** The UNPAID hold created when the student left the details step. */
  booking: Booking;
  busy: boolean;
  onConfirm: (payerName: string) => void;
  onExpired: () => void;
}) {
  const [payerName, setPayerName] = React.useState("");
  const [payerError, setPayerError] = React.useState(false);
  const { dict, locale } = useI18n();
  const t = dict.booking.payment;
  const { bookingType, level, date, timeSlot } = booking;
  const details = booking;
  const slot = findTimeSlot(timeSlot);
  const isPrivate = bookingType === "PRIVATE";
  const left = useCountdown(booking.paymentDeadline, onExpired);

  return (
    <div>
      <section
        aria-labelledby="qris-heading"
        className="relative isolate -mx-4 -mt-4 overflow-hidden border-b border-foreground/10 bg-gradient-to-b from-primary/15 via-background/40 to-transparent px-4 py-6 text-foreground sm:-mx-6 sm:-mt-6 sm:px-6 sm:py-8"
      >
        <div
          aria-hidden="true"
          className="orange-glow pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-full -translate-x-1/2 opacity-60"
        />

        <div className="relative mx-auto max-w-xl text-center">
          <span className="inline-flex rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">
            QRIS
          </span>
          <h4 id="qris-heading" className="mt-3 text-xl font-semibold">
            {t.heading}
          </h4>
          <p className="mt-2 text-sm text-muted-foreground">
            {dict.common.bookingType[bookingType]} · Level {level}
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums sm:text-4xl">
            {formatRupiah(booking.amountDue)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {isPrivate ? t.privateAmountLabel : t.amountLabel}
          </p>

          {booking.paymentCode && (
            <p className="mt-3 text-sm text-muted-foreground">
              {t.paymentCodeLabel}{" "}
              <span className="rounded-md bg-primary/15 px-2 py-0.5 font-mono font-semibold tracking-wider text-primary">
                {booking.paymentCode}
              </span>
            </p>
          )}

          {left !== null && (
            <p
              className="mx-auto mt-3 inline-flex items-center gap-2 neon-border rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary"
              aria-live={left <= 60 ? "polite" : "off"}
            >
              <Timer aria-hidden="true" className="size-4" />
              {t.countdownLabel}{" "}
              <span className="tabular-nums">{formatClock(left)}</span>
            </p>
          )}

          <div className="mx-auto mt-5 max-w-[22rem] rounded-2xl bg-white p-3 shadow-[0_0_40px_rgb(255_107_0/20%)] sm:p-4">
            <Image
              src={qrisImage}
              alt={t.qrisAlt}
              priority
              sizes="(max-width: 640px) calc(100vw - 56px), 320px"
              className="h-auto w-full object-contain"
            />
          </div>

          <p className="mx-auto mt-4 max-w-md text-sm font-medium text-foreground">
            {t.scanInstruction}
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">
            {t.amountInstruction}
          </p>
          <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-muted-foreground/80">
            {format(t.holdNote, { minutes: PAYMENT_HOLD_MINUTES })}
          </p>
        </div>
      </section>

      {isPrivate && (
        <section aria-labelledby="private-heading" className="border-b border-border py-4">
          <h4 id="private-heading" className="font-semibold">
            {t.privatePackageHeading} {level}
          </h4>
          <p className="mt-1 text-sm text-muted-foreground tabular-nums">
            {format(t.privatePerSession, {
              price: formatRupiah(PRIVATE_PACKAGES[level].pricePerSession),
              sessions: String(PRIVATE_PACKAGES[level].sessions),
            })}{" "}
            = {formatRupiah(privatePackageTotal(level))}
          </p>

          <div className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="font-medium">{t.privateIncludesHeading}</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-muted-foreground">
                <li>
                  {format(dict.booking.privatePlans.sessions, {
                    sessions: PRIVATE_PACKAGES[level].sessions,
                  })}
                </li>
                {PRIVATE_PACKAGE_INCLUDES.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium">{t.privateExtrasHeading}</p>
              <ul className="mt-1 flex flex-wrap gap-1.5">
                {PRIVATE_PACKAGE_EXTRAS.map((item) => (
                  <li
                    key={item}
                    className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary"
                  >
                    + {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      <dl className="grid gap-x-6 gap-y-3 border-b border-border py-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">{t.studentName}</dt>
          <dd className="mt-0.5 font-medium">{details.studentName}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t.date}</dt>
          <dd className="mt-0.5 font-medium">{formatLongDate(date, intlTag(locale))}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t.time}</dt>
          <dd className="mt-0.5 font-medium tabular-nums">
            {slot ? `${slot.start} – ${slot.end}` : timeSlot}
          </dd>
        </div>
        {details.whatsappNumber && (
          <div>
            <dt className="text-muted-foreground">{t.whatsappNumber}</dt>
            <dd className="mt-0.5 font-medium tabular-nums">
              {formatWhatsappNumber(details.whatsappNumber)}
            </dd>
          </div>
        )}
        <div>
          <dt className="text-muted-foreground">{t.whatsappGroup}</dt>
          <dd className="mt-0.5 break-words font-medium">{details.whatsappGroupName}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-muted-foreground">{t.lastMaterial}</dt>
          <dd className="mt-0.5 break-words font-medium">{details.lastMaterial}</dd>
        </div>
      </dl>

      <div className="mt-5 space-y-1.5">
        <Label htmlFor="payerName">{t.payerNameLabel}</Label>
        <Input
          id="payerName"
          name="payerName"
          autoComplete="name"
          required
          maxLength={FIELD_LIMITS.payerName.max}
          value={payerName}
          aria-invalid={payerError}
          aria-describedby={payerError ? "payerName-error" : "payerName-hint"}
          onChange={(event) => {
            setPayerName(event.target.value);
            setPayerError(false);
          }}
        />
        {payerError ? (
          <p id="payerName-error" className="text-sm text-destructive">
            {t.payerNameError}
          </p>
        ) : (
          <p id="payerName-hint" className="text-sm text-muted-foreground">
            {t.payerNameHint}
          </p>
        )}
      </div>

      <Button
        type="button"
        size="lg"
        onClick={() => {
          const name = payerName.trim();
          if (name.length < FIELD_LIMITS.payerName.min) {
            setPayerError(true);
            document.getElementById("payerName")?.focus();
            return;
          }
          onConfirm(name);
        }}
        disabled={busy || left === 0}
        className="mt-5 h-12 w-full rounded-xl font-bold hover:bg-primary/90 hover:shadow-[0_0_20px_rgb(255_107_0/40%)]"
      >
        {busy && <Loader2 aria-hidden="true" className="animate-spin" />}
        {busy ? t.processing : t.payButton}
      </Button>
    </div>
  );
}