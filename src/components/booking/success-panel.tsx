"use client";

import { CalendarPlus, CircleCheckBig } from "lucide-react";

import { BookingSummary } from "@/components/booking/booking-summary";
import { StatusBadge } from "@/components/booking/status-badge";
import { Button } from "@/components/ui/button";
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
          <h3 className="text-lg font-semibold tracking-tight">{t.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t.subtext}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">{t.statusLabel}</span>
        <StatusBadge status={booking.status} />
        <span className="text-xs text-muted-foreground">
          {t.reference} <span className="font-mono">{booking.id.slice(0, 8)}</span>
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
