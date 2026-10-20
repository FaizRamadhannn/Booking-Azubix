"use client";

import { CalendarDays, Check } from "lucide-react";

import {
  CLASS_LEVELS,
  PRIVATE_FEATURED_LEVEL,
  PRIVATE_PACKAGE_EXTRAS,
  PRIVATE_PACKAGE_INCLUDES,
  PRIVATE_PACKAGES,
  privatePackageTotal,
} from "@/lib/booking/constants";
import type { ClassLevel } from "@/lib/booking/types";
import { format } from "@/lib/i18n/get-dictionary";
import { useI18n } from "@/lib/i18n/i18n-context";
import { cn, formatRupiah } from "@/lib/utils";

/**
 * Pricing-tier cards for the private packages, one per level, styled after the
 * Stitch "Select Your Tier" section. Used both inside the booking flow and as
 * the landing page's private pricing section (`showHeading={false}` there,
 * since that section supplies its own heading).
 */
export function PrivatePlans({
  value,
  onSelect,
  showHeading = true,
}: {
  value: ClassLevel | null;
  onSelect: (level: ClassLevel) => void;
  showHeading?: boolean;
}) {
  const { dict } = useI18n();
  const t = dict.booking.privatePlans;

  return (
    <section
      aria-labelledby={showHeading ? "private-plans-heading" : undefined}
      aria-label={showHeading ? undefined : t.heading}
    >
      {showHeading && (
        <div className="text-center">
          <h4
            id="private-plans-heading"
            className="text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            {t.heading}
          </h4>
          <p className="mt-2 text-sm text-muted-foreground">{t.subtext}</p>
        </div>
      )}

      <div className={cn("grid gap-6 md:grid-cols-3 md:gap-5", showHeading && "mt-8")}>
        {CLASS_LEVELS.map((level) => {
          const pkg = PRIVATE_PACKAGES[level];
          const featured = level === PRIVATE_FEATURED_LEVEL;
          const selected = value === level;
          return (
            <article
              key={level}
              className={cn(
                "glass-card glass-hover group relative flex flex-col overflow-hidden p-6 sm:p-8",
                featured && "neon-border",
                selected && "border-primary ring-2 ring-primary",
              )}
            >
              {featured && (
                <>
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 bg-primary/5 transition-colors group-hover:bg-primary/10"
                  />
                  <span className="absolute top-4 right-4 rounded-full bg-primary/20 px-3 py-1 text-[0.65rem] font-bold tracking-wide text-primary uppercase">
                    {t.featured}
                  </span>
                </>
              )}

              <h5 className="text-xl font-medium tracking-tight">Private {level}</h5>
              <p className="mt-1 text-sm text-muted-foreground">
                {dict.levels[level].split(" — ")[0]}
              </p>

              <p className="mt-6 flex items-baseline gap-1">
                <span className="text-3xl font-bold tabular-nums sm:text-4xl">
                  {formatRupiah(pkg.pricePerSession)}
                </span>
                <span className="text-sm text-muted-foreground">{t.perSession}</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground tabular-nums">
                {format(t.total, { total: formatRupiah(privatePackageTotal(level)) })}
              </p>

              <ul className="mt-6 mb-8 flex-1 space-y-3 text-sm">
                {[format(t.sessions, { sessions: pkg.sessions }), ...PRIVATE_PACKAGE_INCLUDES].map(
                  (item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                      {item}
                    </li>
                  ),
                )}
              </ul>

              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onSelect(level)}
                className={cn(
                  "h-12 rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]",
                  featured
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_20px_rgb(255_107_0/40%)]"
                    : "border border-foreground/20 hover:border-primary hover:bg-secondary",
                )}
              >
                {format(t.select, { level })}
              </button>
            </article>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="glass-card p-5">
          <p className="text-sm font-semibold">{t.extrasHeading}</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {PRIVATE_PACKAGE_EXTRAS.map((item) => (
              <li
                key={item}
                className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
              >
                + {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm font-semibold">{t.scheduleHeading}</p>
          <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays aria-hidden="true" className="size-4 text-primary" />
            {t.schedule}
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground uppercase">
              {t.scheduleFlexible}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
