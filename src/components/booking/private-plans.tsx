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

/** Pricing-tier cards for the private packages, one per level. */
export function PrivatePlans({
  value,
  onSelect,
}: {
  value: ClassLevel | null;
  onSelect: (level: ClassLevel) => void;
}) {
  const { dict } = useI18n();
  const t = dict.booking.privatePlans;

  return (
    <section
      aria-labelledby="private-plans-heading"
      className="-mx-4 -mt-2 rounded-xl bg-gradient-to-br from-[#073b73] via-[#0d5c99] to-[#1674ad] px-4 py-8 text-white sm:-mx-6 sm:px-6 sm:py-10"
    >
      <div className="text-center">
        <h4
          id="private-plans-heading"
          className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
        >
          {t.heading}
        </h4>
        <p className="mt-2 text-sm text-cyan-100">{t.subtext}</p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3 md:gap-4">
        {CLASS_LEVELS.map((level) => {
          const pkg = PRIVATE_PACKAGES[level];
          const featured = level === PRIVATE_FEATURED_LEVEL;
          const selected = value === level;
          return (
            <article
              key={level}
              className={cn(
                "relative flex flex-col rounded-2xl border p-6",
                featured
                  ? "border-white bg-white text-slate-900 shadow-xl shadow-[#041f3d]/40"
                  : "border-white/15 bg-white/[0.07] text-white",
                selected && "ring-2 ring-amber-400 ring-offset-2 ring-offset-[#0d5c99]",
              )}
            >
              {featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-amber-400 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-slate-950 shadow">
                  {t.featured}
                </span>
              )}

              <h5 className="text-sm font-semibold">Private {level}</h5>
              <p className={cn("mt-1 text-xs", featured ? "text-slate-500" : "text-cyan-100/80")}>
                {dict.levels[level].split(" — ")[0]}
              </p>

              <p className="mt-5 flex items-baseline gap-1">
                <span className="text-2xl font-bold tabular-nums lg:text-3xl">
                  {formatRupiah(pkg.pricePerSession)}
                </span>
                <span className={cn("text-sm", featured ? "text-slate-500" : "text-cyan-100/80")}>
                  {t.perSession}
                </span>
              </p>
              <p className={cn("mt-1 text-xs tabular-nums", featured ? "text-slate-500" : "text-cyan-100/80")}>
                {format(t.total, { total: formatRupiah(privatePackageTotal(level)) })}
              </p>

              <ul className={cn("mt-6 flex-1 space-y-3 text-sm", featured ? "text-slate-700" : "text-cyan-50")}>
                {[format(t.sessions, { sessions: pkg.sessions }), ...PRIVATE_PACKAGE_INCLUDES].map(
                  (item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check
                        aria-hidden="true"
                        className={cn("mt-0.5 size-4 shrink-0", featured ? "text-primary" : "text-cyan-300")}
                      />
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
                  "mt-8 h-11 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d5c99]",
                  featured
                    ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                    : "border border-white/30 text-white hover:bg-white/10",
                )}
              >
                {format(t.select, { level })}
              </button>
            </article>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-white">{t.extrasHeading}</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {PRIVATE_PACKAGE_EXTRAS.map((item) => (
              <li
                key={item}
                className="rounded-md bg-white/15 px-2.5 py-1 text-xs font-semibold text-white ring-1 ring-white/20"
              >
                + {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{t.scheduleHeading}</p>
          <p className="mt-3 flex items-center gap-2 text-sm text-cyan-50">
            <CalendarDays aria-hidden="true" className="size-4 text-cyan-300" />
            {t.schedule}
            <span className="rounded-md bg-amber-400 px-2 py-0.5 text-xs font-bold uppercase text-slate-950">
              {t.scheduleFlexible}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
