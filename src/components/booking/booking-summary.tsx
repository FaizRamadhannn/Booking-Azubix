"use client";

import { LevelBadge } from "@/components/booking/level-badge";
import { privatePackageTotal, TIMEZONE_LABEL } from "@/lib/booking/constants";
import { findTimeSlot, formatLongDate } from "@/lib/booking/datetime";
import type {
  BookingPackageInfo,
  BookingType,
  ClassLevel,
  IsoDate,
  TimeSlotId,
} from "@/lib/booking/types";
import { useI18n } from "@/lib/i18n/i18n-context";
import { intlTag } from "@/lib/i18n/locale";
import { formatRupiah, formatWhatsappNumber, whatsappUrl } from "@/lib/utils";

export interface BookingSummaryData {
  bookingType?: BookingType;
  level: ClassLevel;
  date: IsoDate;
  timeSlot: TimeSlotId;
  studentName: string;
  whatsappGroupName: string;
  lastMaterial: string;
  price?: number;
  paymentCode?: string | null;
  amountDue?: number;
  payerName?: string | null;
  whatsappNumber?: string | null;
  privatePackage?: BookingPackageInfo | null;
}

/** Definition list shared by the review step, the success panel and the admin modal. */
export function BookingSummary({ booking }: { booking: BookingSummaryData }) {
  const { dict, locale } = useI18n();
  const slot = findTimeSlot(booking.timeSlot);
  const labels = dict.booking.review.summaryLabels;

  const rows: Array<{ label: string; value: React.ReactNode }> = [
    { label: labels.studentName, value: booking.studentName },
    ...(booking.bookingType
      ? [{ label: labels.bookingType, value: dict.common.bookingType[booking.bookingType] }]
      : []),
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
    ...(booking.whatsappNumber
      ? [
          {
            label: labels.whatsappNumber,
            value: (
              <a
                href={whatsappUrl(booking.whatsappNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary tabular-nums underline-offset-4 hover:underline"
              >
                {formatWhatsappNumber(booking.whatsappNumber)}
              </a>
            ),
          },
        ]
      : []),
    { label: labels.whatsappGroupName, value: booking.whatsappGroupName },
    { label: labels.lastMaterial, value: booking.lastMaterial },
  ];
  if (booking.price !== undefined) {
    rows.push({ label: labels.price, value: formatRupiah(booking.price) });
  }
  if (booking.bookingType === "PRIVATE") {
    rows.push({
      label: labels.packageTotal,
      value: formatRupiah(privatePackageTotal(booking.level)),
    });
  }
  if (booking.privatePackage) {
    rows.push(
      {
        label: labels.packageCode,
        value: <span className="font-mono">{booking.privatePackage.packageCode}</span>,
      },
      {
        label: labels.packageSessions,
        value: (
          <span className="tabular-nums">
            {booking.privatePackage.sessionsUsed} / {booking.privatePackage.sessionsTotal}
          </span>
        ),
      },
    );
  }
  if (booking.paymentCode) {
    rows.push({
      label: labels.paymentCode,
      value: <span className="font-mono">{booking.paymentCode}</span>,
    });
  }
  if (booking.paymentCode && booking.amountDue !== undefined) {
    rows.push({
      label: labels.amountDue,
      value: <span className="tabular-nums">{formatRupiah(booking.amountDue)}</span>,
    });
  }
  if (booking.payerName) {
    rows.push({ label: labels.payerName, value: booking.payerName });
  }

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
