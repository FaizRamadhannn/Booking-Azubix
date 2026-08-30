"use client";

import { LevelBadge } from "@/components/booking/level-badge";
import { TIMEZONE_LABEL } from "@/lib/booking/constants";
import { findTimeSlot, formatLongDate } from "@/lib/booking/datetime";
import type { ClassLevel, IsoDate, TimeSlotId } from "@/lib/booking/types";
import { useI18n } from "@/lib/i18n/i18n-context";
import { intlTag } from "@/lib/i18n/locale";

export interface BookingSummaryData {
  level: ClassLevel;
  date: IsoDate;
  timeSlot: TimeSlotId;
  studentName: string;
  whatsappGroupName: string;
  lastMaterial: string;
}

/** Definition list shared by the review step, the success panel and the admin modal. */
export function BookingSummary({ booking }: { booking: BookingSummaryData }) {
  const { dict, locale } = useI18n();
  const slot = findTimeSlot(booking.timeSlot);
  const labels = dict.booking.review.summaryLabels;

  const rows: Array<{ label: string; value: React.ReactNode }> = [
    { label: labels.studentName, value: booking.studentName },
    { label: labels.level, value: <LevelBadge level={booking.level} /> },
    { label: labels.date, value: formatLongDate(booking.date, intlTag(locale)) },
    {
      label: labels.time,
      value: (
        <span className="tabular-nums">
          {slot ? `${slot.start} – ${slot.end}` : booking.timeSlot}{" "}
          <span className="text-muted-foreground">({TIMEZONE_LABEL})</span>
        </span>
      ),
    },
    { label: labels.whatsappGroupName, value: booking.whatsappGroupName },
    { label: labels.lastMaterial, value: booking.lastMaterial },
  ];

  return (
    <dl className="divide-y divide-border rounded-lg border border-border">
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid gap-1 px-4 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4"
        >
          <dt className="text-sm text-muted-foreground">{row.label}</dt>
          <dd className="text-sm font-medium break-words">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
