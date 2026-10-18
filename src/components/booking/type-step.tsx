"use client";

import { ChevronRight, QrCode, UserRound } from "lucide-react";

import { BOOKING_TYPES } from "@/lib/booking/constants";
import type { BookingType } from "@/lib/booking/types";
import { useI18n } from "@/lib/i18n/i18n-context";
import { cn } from "@/lib/utils";

const ICONS: Record<BookingType, typeof QrCode> = {
  REGULAR: QrCode,
  PRIVATE: UserRound,
};

export function TypeStep({
  value,
  onSelect,
}: {
  value: BookingType | null;
  onSelect: (type: BookingType) => void;
}) {
  const { dict } = useI18n();
  const t = dict.booking.bookingType;

  return (
    <fieldset>
      <legend className="text-base font-semibold tracking-tight">{t.legend}</legend>
      <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {BOOKING_TYPES.map((type) => {
          const selected = value === type;
          const Icon = ICONS[type];
          return (
            <button
              key={type}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(type)}
              className={cn(
                "group flex h-full flex-col rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary/50 hover:bg-accent",
                selected && "border-primary bg-primary/5 ring-1 ring-primary",
              )}
            >
              <span className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                  <Icon aria-hidden="true" className="size-5 text-primary" />
                  {t.options[type].title}
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                />
              </span>
              <span className="mt-1 text-sm text-muted-foreground">
                {t.options[type].description}
              </span>
              {selected && <span className="sr-only">{t.srSelected}</span>}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
