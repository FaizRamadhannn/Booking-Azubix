"use client";

import { ChevronRight } from "lucide-react";

import { CLASS_LEVELS } from "@/lib/booking/constants";
import type { ClassLevel } from "@/lib/booking/types";
import { useI18n } from "@/lib/i18n/i18n-context";
import { cn } from "@/lib/utils";

export function LevelStep({
  value,
  onSelect,
}: {
  value: ClassLevel | null;
  onSelect: (level: ClassLevel) => void;
}) {
  const { dict } = useI18n();

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
                "group flex h-full flex-col rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary/50 hover:bg-accent",
                selected && "border-primary bg-primary/5 ring-1 ring-primary",
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
              {selected && <span className="sr-only">{dict.booking.level.srSelected}</span>}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
