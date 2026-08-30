"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

import { SlotOptionList } from "@/components/booking/slot-option-list";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatLongDate } from "@/lib/booking/datetime";
import type { DayAvailability, IsoDate, TimeSlotId } from "@/lib/booking/types";
import { getClosedReason } from "@/lib/i18n/booking-text";
import { useI18n } from "@/lib/i18n/i18n-context";
import { intlTag } from "@/lib/i18n/locale";

export type LoadState = "loading" | "error" | "ready";

export function TimeStep({
  date,
  availability,
  state,
  value,
  onSelect,
  onRetry,
}: {
  date: IsoDate;
  availability: DayAvailability | null;
  state: LoadState;
  value: TimeSlotId | null;
  onSelect: (slot: TimeSlotId) => void;
  onRetry: () => void;
}) {
  const { dict, locale } = useI18n();
  const t = dict.booking.time;

  return (
    <fieldset>
      <legend className="text-base font-semibold tracking-tight">{t.legend}</legend>
      <p className="mt-1 text-sm text-muted-foreground">
        {formatLongDate(date, intlTag(locale))}
      </p>

      {state === "loading" && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2" aria-busy="true">
          <span className="sr-only" role="status">
            {t.loading}
          </span>
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      )}

      {state === "error" && (
        <div
          role="alert"
          className="mt-4 flex flex-col items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm"
        >
          <p className="flex items-start gap-2 text-destructive">
            <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {t.loadError}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw aria-hidden="true" />
            {dict.common.tryAgain}
          </Button>
        </div>
      )}

      {state === "ready" && availability && !availability.isOpen && (
        <p
          role="status"
          className="mt-4 rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground"
        >
          {getClosedReason(dict, locale, date)}
        </p>
      )}

      {state === "ready" && availability?.isOpen && (
        <>
          <SlotOptionList
            className="mt-4"
            slots={availability.slots}
            value={value}
            onSelect={onSelect}
          />
          {availability.slots.every((slot) => slot.status !== "AVAILABLE") && (
            <p role="status" className="mt-3 text-sm text-muted-foreground">
              {t.noTimesLeft}
            </p>
          )}
        </>
      )}
    </fieldset>
  );
}
