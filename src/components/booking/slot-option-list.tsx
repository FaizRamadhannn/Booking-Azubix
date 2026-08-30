"use client";

import { StatusBadge } from "@/components/booking/status-badge";
import { format } from "@/lib/i18n/get-dictionary";
import { useI18n } from "@/lib/i18n/i18n-context";
import { getSlotReason } from "@/lib/i18n/booking-text";
import type { SlotAvailability, TimeSlotId } from "@/lib/booking/types";
import { cn } from "@/lib/utils";

/**
 * The selectable list of time slots, shared by the student booking flow and the
 * admin reschedule form so the two can never disagree about what is bookable.
 */
export function SlotOptionList({
  slots,
  value,
  onSelect,
  className,
}: {
  slots: SlotAvailability[];
  value: TimeSlotId | null;
  onSelect: (slot: TimeSlotId) => void;
  className?: string;
}) {
  const { dict } = useI18n();

  return (
    <ul className={cn("grid gap-2 sm:grid-cols-2", className)}>
      {slots.map((slot) => {
        const selectable = slot.status === "AVAILABLE";
        const selected = value === slot.timeSlot;
        const reason = getSlotReason(dict, slot.status, slot.bookedLevel);
        return (
          <li key={slot.timeSlot}>
            <button
              type="button"
              disabled={!selectable}
              aria-pressed={selected}
              aria-label={format(dict.booking.time.slotAriaLabel, {
                start: slot.start,
                end: slot.end,
                reason,
              })}
              onClick={() => onSelect(slot.timeSlot)}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors",
                "enabled:hover:border-primary/50 enabled:hover:bg-accent",
                !selectable &&
                  "cursor-not-allowed border-destructive/25 bg-destructive/5 opacity-90",
                selected && "border-primary bg-primary/5 ring-1 ring-primary",
              )}
            >
              <span>
                <span
                  className={cn(
                    "block font-medium tabular-nums",
                    !selectable && "text-destructive/90",
                  )}
                >
                  {slot.start} – {slot.end}
                </span>
                <span className="block text-xs text-muted-foreground">{reason}</span>
              </span>
              <StatusBadge status={slot.status} emphasis="unavailable" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
