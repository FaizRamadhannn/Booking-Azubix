"use client";

import { LevelBadge } from "@/components/booking/level-badge";
import { StatusBadge } from "@/components/booking/status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { findTimeSlot, formatShortDate } from "@/lib/booking/datetime";
import type { Booking } from "@/lib/booking/types";
import { format } from "@/lib/i18n/get-dictionary";
import { useI18n } from "@/lib/i18n/i18n-context";
import { intlTag } from "@/lib/i18n/locale";

function slotRange(booking: Booking): string {
  const slot = findTimeSlot(booking.timeSlot);
  return slot ? `${slot.start} – ${slot.end}` : booking.timeSlot;
}

export function BookingsTable({
  bookings,
  onInspect,
}: {
  bookings: Booking[];
  onInspect: (booking: Booking) => void;
}) {
  const { dict, locale } = useI18n();
  const t = dict.admin.table;
  const tag = intlTag(locale);

  return (
    <>
      {/* Table on tablet and desktop. */}
      <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">{t.date}</TableHead>
              <TableHead scope="col">{t.time}</TableHead>
              <TableHead scope="col">{t.level}</TableHead>
              <TableHead scope="col">{t.student}</TableHead>
              <TableHead scope="col">{t.whatsappGroup}</TableHead>
              <TableHead scope="col">{t.lastMaterial}</TableHead>
              <TableHead scope="col">{t.status}</TableHead>
              <TableHead scope="col">
                <span className="sr-only">{t.actions}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="whitespace-nowrap font-medium">
                  {formatShortDate(booking.date, tag)}
                </TableCell>
                <TableCell className="whitespace-nowrap tabular-nums">
                  {slotRange(booking)}
                </TableCell>
                <TableCell>
                  <LevelBadge level={booking.level} />
                </TableCell>
                <TableCell className="max-w-40 truncate">
                  {booking.studentName}
                </TableCell>
                <TableCell className="max-w-40 truncate">
                  {booking.whatsappGroupName}
                </TableCell>
                <TableCell className="max-w-56 truncate">
                  {booking.lastMaterial}
                </TableCell>
                <TableCell>
                  <StatusBadge status={booking.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onInspect(booking)}
                  >
                    {t.view}
                    <span className="sr-only">
                      {format(t.srBookingFor, {
                        name: booking.studentName,
                        date: formatShortDate(booking.date, tag),
                      })}
                    </span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Stacked cards on mobile, where a seven-column table is unusable. */}
      <ul className="space-y-2 md:hidden">
        {bookings.map((booking) => (
          <li key={booking.id} className="rounded-lg border border-border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{formatShortDate(booking.date, tag)}</p>
                <p className="text-sm tabular-nums text-muted-foreground">
                  {slotRange(booking)}
                </p>
              </div>
              <StatusBadge status={booking.status} />
            </div>

            <dl className="mt-3 space-y-1 text-sm">
              <div className="flex gap-2">
                <dt className="text-muted-foreground">{t.level}</dt>
                <dd>
                  <LevelBadge level={booking.level} />
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted-foreground">{t.student}</dt>
                <dd className="font-medium">{booking.studentName}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted-foreground">{t.group}</dt>
                <dd className="truncate">{booking.whatsappGroupName}</dd>
              </div>
            </dl>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 w-full"
              onClick={() => onInspect(booking)}
            >
              {t.viewDetails}
              <span className="sr-only">{format(t.srFor, { name: booking.studentName })}</span>
            </Button>
          </li>
        ))}
      </ul>
    </>
  );
}
