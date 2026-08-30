"use client";

import { CalendarX2 } from "lucide-react";

import { TIMEZONE_LABEL } from "@/lib/booking/constants";
import { formatLongDate, formatMonthShort, formatWeekdayShort } from "@/lib/booking/datetime";
import type { CalendarDay, IsoDate } from "@/lib/booking/types";
import { format } from "@/lib/i18n/get-dictionary";
import { useI18n } from "@/lib/i18n/i18n-context";
import { intlTag } from "@/lib/i18n/locale";
import { cn } from "@/lib/utils";

export function DateStep({
  calendar,
  value,
  onSelect,
}: {
  calendar: CalendarDay[];
  value: IsoDate | null;
  onSelect: (date: IsoDate) => void;
}) {
  const { dict, locale } = useI18n();
  const t = dict.booking.date;
  const tag = intlTag(locale);
  const hasOpenDay = calendar.some((day) => day.selectable);

  return (
    <fieldset>
      <legend className="text-base font-semibold tracking-tight">{t.legend}</legend>
      <p className="mt-1 text-sm text-muted-foreground">
        {format(t.description, { timezone: TIMEZONE_LABEL })}
      </p>

      {!hasOpenDay ? (
        <p
          role="status"
          className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground"
        >
          <CalendarX2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {t.emptyState}
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
          {calendar.map((day) => {
            const selected = value === day.date;
            const unavailable = !day.selectable;
            const longDate = formatLongDate(day.date, tag);
            const label = day.isWeekend
              ? format(t.ariaWeekend, { date: longDate })
              : day.selectable
                ? format(t.ariaOpen, { date: longDate, available: day.availableSlots, total: day.totalSlots })
                : format(t.ariaUnavailable, { date: longDate });

            return (
              <button
                key={day.date}
                type="button"
                disabled={!day.selectable}
                aria-pressed={selected}
                aria-label={label}
                title={label}
                onClick={() => onSelect(day.date)}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center rounded-lg border border-border bg-card px-1 py-2 text-center transition-colors",
                  "enabled:hover:border-primary/50 enabled:hover:bg-accent",
                  unavailable &&
                    "cursor-not-allowed border-destructive/25 bg-destructive/5 opacity-90",
                  selected && "border-primary bg-primary/5 ring-1 ring-primary",
                )}
              >
                <span className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
                  {formatWeekdayShort(day.date, tag)}
                </span>
                <span
                  className={cn(
                    "text-base font-semibold leading-tight",
                    unavailable && "text-destructive/90",
                  )}
                >
                  {day.dayOfMonth}
                </span>
                <span className="text-[0.65rem] text-muted-foreground">
                  {day.isToday ? t.today : formatMonthShort(day.date, tag)}
                </span>
                <span
                  className={cn(
                    "mt-0.5 text-[0.65rem] leading-none",
                    unavailable ? "font-medium text-destructive/90" : "text-muted-foreground",
                  )}
                >
                  {day.isWeekend
                    ? t.closed
                    : day.availableSlots > 0
                      ? format(t.freeCount, { count: day.availableSlots })
                      : t.full}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </fieldset>
  );
}
