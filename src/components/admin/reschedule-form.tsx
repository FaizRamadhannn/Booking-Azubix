"use client";

import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

import { SlotOptionList } from "@/components/booking/slot-option-list";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { formatLongDate } from "@/lib/booking/datetime";
import type {
  Booking,
  CalendarDay,
  DayAvailability,
  IsoDate,
  TimeSlotId,
} from "@/lib/booking/types";
import { getClosedReason } from "@/lib/i18n/booking-text";
import { format } from "@/lib/i18n/get-dictionary";
import { useI18n } from "@/lib/i18n/i18n-context";
import { intlTag } from "@/lib/i18n/locale";

type LoadState = "loading" | "error" | "ready";

const selectClass =
  "h-9 w-full rounded-lg border border-border bg-background px-2.5 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-50";

/**
 * Moves an existing booking to another slot. The date list is supplied by the
 * dashboard, while the slots for the chosen date are fetched live from the same
 * endpoint the student flow uses — and the server revalidates the move anyway.
 */
export function RescheduleForm({
  booking,
  calendar,
  pending,
  error,
  onSubmit,
  onBack,
}: {
  booking: Booking;
  /** Open dates, resolved on the server and refreshed after every change. */
  calendar: CalendarDay[];
  pending: boolean;
  error: string | null;
  onSubmit: (target: { date: IsoDate; timeSlot: TimeSlotId }) => void;
  onBack: () => void;
}) {
  const { dict, locale } = useI18n();
  const t = dict.admin.reschedule;
  const tag = intlTag(locale);

  const [date, setDate] = React.useState<IsoDate | "">("");
  const [day, setDay] = React.useState<DayAvailability | null>(null);
  const [dayState, setDayState] = React.useState<LoadState>("ready");
  const [timeSlot, setTimeSlot] = React.useState<TimeSlotId | null>(null);

  const openDates = calendar.filter((entry) => entry.selectable);

  const loadDay = React.useCallback(async (target: IsoDate) => {
    setDayState("loading");
    try {
      const response = await fetch(`/api/availability/${target}`, {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("failed");
      setDay((await response.json()) as DayAvailability);
      setDayState("ready");
    } catch {
      setDay(null);
      setDayState("error");
    }
  }, []);

  function selectDate(next: string) {
    setDate(next);
    setTimeSlot(null);
    setDay(null);
    if (next) void loadDay(next);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {format(t.currently, {
          date: formatLongDate(booking.date, tag),
          time: booking.timeSlot.replace("-", " – "),
        })}
      </p>

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="reschedule-date">{t.newDate}</Label>

        {openDates.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.noOpenDates}</p>
        ) : (
          <select
            id="reschedule-date"
            className={selectClass}
            value={date}
            disabled={pending}
            onChange={(event) => selectDate(event.target.value)}
          >
            <option value="">{t.chooseDate}</option>
            {openDates.map((entry) => (
              <option key={entry.date} value={entry.date}>
                {format(t.dateOptionFree, {
                  date: formatLongDate(entry.date, tag),
                  count: entry.availableSlots,
                })}
              </option>
            ))}
          </select>
        )}
      </div>

      {date && (
        <div className="space-y-1.5">
          <span className="text-sm font-medium">{t.newTime}</span>

          {dayState === "loading" && (
            <div className="grid gap-2 sm:grid-cols-2" aria-busy="true">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          )}

          {dayState === "error" && (
            <div className="flex items-center gap-2">
              <p className="text-sm text-destructive">{t.loadTimesError}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void loadDay(date)}
              >
                <RefreshCw aria-hidden="true" />
                {dict.common.retry}
              </Button>
            </div>
          )}

          {dayState === "ready" && day?.isOpen && (
            <SlotOptionList
              slots={day.slots}
              value={timeSlot}
              onSelect={setTimeSlot}
            />
          )}

          {dayState === "ready" && day && !day.isOpen && (
            <p className="text-sm text-muted-foreground">
              {getClosedReason(dict, locale, date)}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={pending}
        >
          {t.back}
        </Button>
        <Button
          type="button"
          disabled={pending || !date || !timeSlot}
          onClick={() => date && timeSlot && onSubmit({ date, timeSlot })}
        >
          {pending ? t.moving : t.moveBooking}
        </Button>
      </div>
    </div>
  );
}
