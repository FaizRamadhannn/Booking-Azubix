"use client";

import { Check } from "lucide-react";

import { useI18n } from "@/lib/i18n/i18n-context";
import { cn } from "@/lib/utils";

/** Ids and order are business logic; the display label lives in the dictionary. */
export const BOOKING_STEPS = [
  "level",
  "date",
  "time",
  "details",
  "review",
] as const;

export type BookingStepId = (typeof BOOKING_STEPS)[number];

export function Stepper({ current }: { current: BookingStepId }) {
  const { dict } = useI18n();
  const currentIndex = BOOKING_STEPS.indexOf(current);
  const labels = dict.booking.stepper.steps;

  return (
    <nav aria-label="Booking progress">
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-2 text-xs sm:text-sm">
        {BOOKING_STEPS.map((step, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;
          return (
            <li key={step} className="flex items-center gap-1">
              <span
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-2 py-1 font-medium",
                  isCurrent && "bg-primary/10 text-primary",
                  isDone && "text-foreground",
                  !isCurrent && !isDone && "text-muted-foreground",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full border text-[0.65rem] font-semibold",
                    isCurrent &&
                      "border-primary bg-primary text-primary-foreground",
                    isDone && "border-primary/40 bg-primary/10 text-primary",
                    !isCurrent &&
                      !isDone &&
                      "border-border text-muted-foreground",
                  )}
                >
                  {isDone ? <Check className="size-3" /> : index + 1}
                </span>
                {labels[step]}
                {isDone && <span className="sr-only">{dict.booking.stepper.completedSuffix}</span>}
              </span>
              {index < BOOKING_STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className="hidden h-px w-4 bg-border sm:block"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
