"use client";

import { ChevronRight } from "lucide-react";

import { PackageCodeForm } from "@/components/booking/package-code-form";
import { PrivatePlans } from "@/components/booking/private-plans";
import { CLASS_LEVELS, pricePerSession } from "@/lib/booking/constants";
import type { BookingType, ClassLevel, PackageLookup } from "@/lib/booking/types";
import { format } from "@/lib/i18n/get-dictionary";
import { useI18n } from "@/lib/i18n/i18n-context";
import { cn, formatRupiah } from "@/lib/utils";

export function LevelStep({
  bookingType,
  value,
  onSelect,
  onPackageApplied,
}: {
  bookingType: BookingType;
  value: ClassLevel | null;
  onSelect: (level: ClassLevel) => void;
  /** Private only: the student already owns a paid package. */
  onPackageApplied: (pkg: PackageLookup, whatsappNumber: string) => void;
}) {
  const { dict } = useI18n();

  if (bookingType === "PRIVATE") {
    return (
      <>
        <PackageCodeForm onApplied={onPackageApplied} />
        <PrivatePlans value={value} onSelect={onSelect} />
      </>
    );
  }

  return (
    <fieldset>
      <legend className="text-base font-semibold tracking-tight">
        {dict.booking.level.legend}
      </legend>
      <p className="mt-1 text-sm text-muted-foreground">
        {dict.booking.level.description}
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {CLASS_LEVELS.map((level) => {
          const selected = value === level;
          return (
            <button
              key={level}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(level)}
              className={cn(
                "glass-card glass-hover group flex h-full flex-col rounded-2xl p-5 text-left",
                selected && "neon-border bg-primary/10",
              )}
            >
              <span className="flex items-center justify-between">
                <span className="font-mono text-lg font-semibold tracking-tight">
                  {level}
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                />
              </span>
              <span className="mt-1 text-sm text-muted-foreground">
                {dict.levels[level]}
              </span>
              <span className="mt-3 text-sm font-semibold tabular-nums">
                {format(dict.booking.pricing.perSession, {
                  price: formatRupiah(pricePerSession(bookingType, level)),
                })}
              </span>
              {selected && <span className="sr-only">{dict.booking.level.srSelected}</span>}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
