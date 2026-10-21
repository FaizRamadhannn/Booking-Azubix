"use client";

import * as React from "react";
import { CalendarPlus, Check, CircleCheckBig, Copy, KeyRound } from "lucide-react";

import { BookingSummary } from "@/components/booking/booking-summary";
import { PaymentStatusBadge } from "@/components/booking/payment-status-badge";
import { StatusBadge } from "@/components/booking/status-badge";
import { Button } from "@/components/ui/button";
import { format } from "@/lib/i18n/get-dictionary";
import { useI18n } from "@/lib/i18n/i18n-context";
import type { Booking } from "@/lib/booking/types";

export function SuccessPanel({
  booking,
  onBookAgain,
}: {
  booking: Booking;
  onBookAgain: () => void;
}) {
  const { dict } = useI18n();
  const t = dict.booking.success;
  const pkg = booking.privatePackage;
  // A session booked from a package has nothing to pay; the first private
  // booking is the one that buys the package.
  const fromPackage = pkg !== null && booking.amountDue === 0;
  const boughtPackage = pkg !== null && !fromPackage;

  return (
    <div>
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-success-muted text-success"
        >
          <CircleCheckBig className="size-5" />
        </span>
        <div>
          <h3 className="text-lg font-semibold tracking-tight">
            {fromPackage ? t.packageTitle : t.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {fromPackage ? t.packageSubtext : t.subtext}
          </p>
          {fromPackage && pkg && (
            <p className="mt-1 text-sm font-medium">
              {format(t.packageRemaining, {
                remaining: pkg.sessionsTotal - pkg.sessionsUsed,
                total: pkg.sessionsTotal,
              })}
            </p>
          )}
        </div>
      </div>

      {boughtPackage && pkg && <PackageCodeCard code={pkg.packageCode} />}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">{t.statusLabel}</span>
        <StatusBadge status={booking.status} />
        <span className="text-sm text-muted-foreground">{t.paymentStatusLabel}</span>
        <PaymentStatusBadge status={booking.paymentStatus} />
        <span className="text-xs text-muted-foreground">
          {t.reference}{" "}
          <span className="font-mono">{booking.paymentCode ?? booking.id.slice(0, 8)}</span>
        </span>
      </div>

      <div className="mt-4">
        <BookingSummary booking={booking} />
      </div>

      <div className="mt-6">
        <Button type="button" onClick={onBookAgain} size="lg">
          <CalendarPlus aria-hidden="true" />
          {t.bookAnother}
        </Button>
      </div>
    </div>
  );
}

/** The code a private student needs for every later session. */
function PackageCodeCard({ code }: { code: string }) {
  const { dict } = useI18n();
  const t = dict.booking.success;
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the code is still on screen to write down.
    }
  }

  return (
    <section
      aria-labelledby="package-code-result"
      className="neon-border mt-5 rounded-2xl bg-primary/10 p-4"
    >
      <h4
        id="package-code-result"
        className="flex items-center gap-2 text-sm font-semibold"
      >
        <KeyRound aria-hidden="true" className="size-4 text-primary" />
        {t.packageCodeHeading}
      </h4>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <span className="font-mono text-2xl font-bold tracking-wider text-primary">
          {code}
        </span>
        <Button type="button" variant="outline" size="sm" onClick={() => void copy()}>
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          {copied ? t.copied : t.copy}
        </Button>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{t.packageCodeNote}</p>
    </section>
  );
}
