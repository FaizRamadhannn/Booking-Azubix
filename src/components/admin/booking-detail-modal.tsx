"use client";

import * as React from "react";
import { AlertCircle, CalendarClock, CircleX } from "lucide-react";

import { RescheduleForm } from "@/components/admin/reschedule-form";
import { BookingSummary } from "@/components/booking/booking-summary";
import { StatusBadge } from "@/components/booking/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateTime, formatLongDate } from "@/lib/booking/datetime";
import type {
  Booking,
  CalendarDay,
  IsoDate,
  TimeSlotId,
} from "@/lib/booking/types";
import { format } from "@/lib/i18n/get-dictionary";
import { useI18n } from "@/lib/i18n/i18n-context";
import { intlTag } from "@/lib/i18n/locale";

type View = "details" | "reschedule" | "confirm-cancel";

export interface BookingMutationResult {
  ok: boolean;
  message?: string;
}

/**
 * Reusable booking inspector with the admin's cancel and reschedule actions.
 * Driven by `booking`, so the caller only has to hold the selected row.
 */
export function BookingDetailModal({
  booking,
  calendar,
  onOpenChange,
  onCancelBooking,
  onRescheduleBooking,
}: {
  booking: Booking | null;
  /** Open dates offered by the reschedule form. */
  calendar: CalendarDay[];
  onOpenChange: (open: boolean) => void;
  onCancelBooking: (id: string) => Promise<BookingMutationResult>;
  onRescheduleBooking: (
    id: string,
    target: { date: IsoDate; timeSlot: TimeSlotId },
  ) => Promise<BookingMutationResult>;
}) {
  const { dict, locale } = useI18n();
  const t = dict.admin.detail;
  const tag = intlTag(locale);

  const [view, setView] = React.useState<View>("details");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function run(action: () => Promise<BookingMutationResult>) {
    setPending(true);
    setError(null);
    const result = await action();
    setPending(false);
    if (result.ok) {
      setView("details");
      onOpenChange(false);
    } else {
      setError(result.message ?? dict.errors.genericRetry);
    }
  }

  const canCancel = booking?.status === "BOOKED";
  const canReschedule =
    booking?.status === "BOOKED" || booking?.status === "EXPIRED";

  const title =
    view === "reschedule"
      ? t.titleReschedule
      : view === "confirm-cancel"
        ? t.titleConfirmCancel
        : t.titleDetails;

  return (
    <Dialog
      open={booking !== null}
      onOpenChange={(open) => {
        if (!open) {
          setView("details");
          setError(null);
        }
        onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {booking
              ? view === "confirm-cancel"
                ? `${booking.studentName} — ${formatLongDate(booking.date, tag)}`
                : formatLongDate(booking.date, tag)
              : t.noBookingSelected}
          </DialogDescription>
        </DialogHeader>

        {booking && view === "details" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={booking.status} />
              <span className="text-xs text-muted-foreground">
                {t.reference}{" "}
                <span className="font-mono">{booking.id.slice(0, 8)}</span>
              </span>
            </div>

            <BookingSummary booking={booking} />

            <p className="text-xs text-muted-foreground">
              {format(t.createdUpdated, {
                created: formatDateTime(booking.createdAt, tag),
                updated: formatDateTime(booking.updatedAt, tag),
              })}
            </p>

            {booking.status === "CANCELLED" && (
              <p className="text-sm text-muted-foreground">{t.cancelledNotice}</p>
            )}
          </div>
        )}

        {booking && view === "reschedule" && (
          <RescheduleForm
            booking={booking}
            calendar={calendar}
            pending={pending}
            error={error}
            onBack={() => {
              setError(null);
              setView("details");
            }}
            onSubmit={(target) =>
              void run(() => onRescheduleBooking(booking.id, target))
            }
          />
        )}

        {booking && view === "confirm-cancel" && (
          <div className="space-y-4">
            <p className="text-sm">
              {format(t.confirmCancelBody, {
                level: booking.level,
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

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                disabled={pending}
                onClick={() => {
                  setError(null);
                  setView("details");
                }}
              >
                {t.keepBooking}
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={pending}
                onClick={() => void run(() => onCancelBooking(booking.id))}
              >
                {pending ? t.cancelling : t.cancelBooking}
              </Button>
            </div>
          </div>
        )}

        {view === "details" && (
          <DialogFooter className="gap-2">
            <DialogClose render={<Button variant="outline">{dict.common.close}</Button>} />
            {canReschedule && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setView("reschedule")}
              >
                <CalendarClock aria-hidden="true" />
                {t.reschedule}
              </Button>
            )}
            {canCancel && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setView("confirm-cancel")}
              >
                <CircleX aria-hidden="true" />
                {t.cancelBooking}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
