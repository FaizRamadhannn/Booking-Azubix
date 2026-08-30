"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CLASS_LEVELS } from "@/lib/booking/constants";
import type { BookingFilters } from "@/lib/booking/types";
import { useI18n } from "@/lib/i18n/i18n-context";
import { cn } from "@/lib/utils";

const STATUS_VALUES = ["BOOKED", "EXPIRED", "CANCELLED"] as const;

const selectClass =
  "h-9 w-full rounded-lg border border-border bg-background px-2.5 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

export function BookingFiltersBar({
  filters,
  onChange,
  disabled,
}: {
  filters: BookingFilters;
  onChange: (next: BookingFilters) => void;
  disabled?: boolean;
}) {
  const { dict } = useI18n();
  const t = dict.admin.filters;
  const hasFilters = Boolean(filters.date || filters.level || filters.status);

  return (
    <section
      aria-labelledby="filters-heading"
      className="rounded-lg border border-border p-4"
    >
      <h2 id="filters-heading" className="text-sm font-medium">
        {t.heading}
      </h2>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="filter-date">{t.dateLabel}</Label>
          <Input
            id="filter-date"
            type="date"
            disabled={disabled}
            value={filters.date ?? ""}
            onChange={(event) =>
              onChange({ ...filters, date: event.target.value || undefined })
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-level">{t.levelLabel}</Label>
          <select
            id="filter-level"
            className={cn(selectClass, disabled && "opacity-50")}
            disabled={disabled}
            value={filters.level ?? ""}
            onChange={(event) =>
              onChange({
                ...filters,
                level: (event.target.value ||
                  undefined) as BookingFilters["level"],
              })
            }
          >
            <option value="">{t.allLevels}</option>
            {CLASS_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-status">{t.statusLabel}</Label>
          <select
            id="filter-status"
            className={cn(selectClass, disabled && "opacity-50")}
            disabled={disabled}
            value={filters.status ?? ""}
            onChange={(event) =>
              onChange({
                ...filters,
                status: (event.target.value ||
                  undefined) as BookingFilters["status"],
              })
            }
          >
            <option value="">{t.allStatuses}</option>
            {STATUS_VALUES.map((value) => (
              <option key={value} value={value}>
                {dict.common.status[value]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasFilters && (
        <div className="mt-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange({})}
          >
            <X aria-hidden="true" />
            {t.clear}
          </Button>
        </div>
      )}
    </section>
  );
}
