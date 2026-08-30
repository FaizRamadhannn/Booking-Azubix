"use client";

import {
  CalendarCheck,
  CalendarX2,
  CircleCheck,
  CircleSlash,
} from "lucide-react";

import { useI18n } from "@/lib/i18n/i18n-context";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/lib/booking/types";

/**
 * Status is communicated by icon *and* wording, never by colour alone, so the
 * meaning survives greyscale printing and colour-vision deficiency.
 */
const STATUS_PRESENTATION: Record<
  BookingStatus,
  { icon: typeof CircleCheck; className: string }
> = {
  AVAILABLE: {
    icon: CircleCheck,
    className: "border-success/40 bg-success-muted text-success",
  },
  BOOKED: {
    icon: CalendarCheck,
    className: "border-primary/40 bg-primary/10 text-primary",
  },
  EXPIRED: {
    icon: CircleSlash,
    className: "border-border bg-muted text-muted-foreground",
  },
  CANCELLED: {
    icon: CalendarX2,
    className: "border-destructive/40 bg-destructive/10 text-destructive",
  },
};

/** Forces the destructive/red tone regardless of status, keeping the same icon and label. */
const UNAVAILABLE_TONE = "border-destructive/40 bg-destructive/10 text-destructive";

export function StatusBadge({
  status,
  className,
  emphasis,
}: {
  status: BookingStatus;
  className?: string;
  /**
   * Pass `"unavailable"` in a *picker* (choosing a slot to book), where a
   * booked or expired slot means "you cannot pick this" and should read as
   * red. Never use this in a booking-record view (success panel, admin
   * table): there, `BOOKED` describes a healthy reservation, not a blocker.
   */
  emphasis?: "unavailable";
}) {
  const { dict } = useI18n();
  const { icon: Icon, className: tone } = STATUS_PRESENTATION[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        emphasis === "unavailable" && status !== "AVAILABLE" ? UNAVAILABLE_TONE : tone,
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-3.5 shrink-0" />
      {dict.common.status[status]}
    </span>
  );
}
