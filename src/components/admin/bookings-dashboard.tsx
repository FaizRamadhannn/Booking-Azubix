"use client";

import * as React from "react";
import { AlertCircle, CalendarSearch, RefreshCw } from "lucide-react";

import {
  BookingDetailModal,
  type BookingMutationResult,
} from "@/components/admin/booking-detail-modal";
import { BookingFiltersBar } from "@/components/admin/booking-filters";
import { BookingsTable } from "@/components/admin/bookings-table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  Booking,
  BookingFilters,
  CalendarDay,
  IsoDate,
  TimeSlotId,
} from "@/lib/booking/types";
import type { BookingErrorBody, BookingErrorCode } from "@/lib/booking/errors";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { I18nProvider, useI18n } from "@/lib/i18n/i18n-context";
import type { Locale } from "@/lib/i18n/locale";

type LoadState = "loading" | "error" | "ready";

function toQueryString(filters: BookingFilters): string {
  const params = new URLSearchParams();
  if (filters.date) params.set("date", filters.date);
  if (filters.level) params.set("level", filters.level);
  if (filters.status) params.set("status", filters.status);
  const query = params.toString();
  return query ? `?${query}` : "";
}

/** Counters that make the next few days easy to scan at a glance. */
function summarise(bookings: Booking[], today: IsoDate) {
  const upcoming = bookings.filter(
    (booking) => booking.status === "BOOKED" && booking.date >= today,
  );
  return {
    total: bookings.length,
    today: upcoming.filter((booking) => booking.date === today).length,
    upcoming: upcoming.length,
  };
}

export function BookingsDashboard({
  today,
  initialBookings,
  initialCalendar,
  dict,
  locale,
}: {
  today: IsoDate;
  /** Rendered on the server, so the first paint already shows real data. */
  initialBookings: Booking[];
  /** Open dates for the reschedule form, also resolved on the server. */
  initialCalendar: CalendarDay[];
  dict: Dictionary;
  locale: Locale;
}) {
  return (
    <I18nProvider locale={locale} dict={dict}>
      <BookingsDashboardInner
        today={today}
        initialBookings={initialBookings}
        initialCalendar={initialCalendar}
      />
    </I18nProvider>
  );
}

function BookingsDashboardInner({
  today,
  initialBookings,
  initialCalendar,
}: {
  today: IsoDate;
  initialBookings: Booking[];
  initialCalendar: CalendarDay[];
}) {
  const { dict } = useI18n();
  const [filters, setFilters] = React.useState<BookingFilters>({});
  const [bookings, setBookings] = React.useState<Booking[]>(initialBookings);
  const [state, setState] = React.useState<LoadState>("ready");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<Booking | null>(null);
  const [calendar, setCalendar] =
    React.useState<CalendarDay[]>(initialCalendar);

  const load = React.useCallback(
    async (activeFilters: BookingFilters) => {
      setState("loading");
      setErrorMessage(null);
      try {
        const response = await fetch(
          `/api/bookings${toQueryString(activeFilters)}`,
          { cache: "no-store" },
        );
        if (response.status === 401) {
          throw new Error(dict.errors.UNAUTHORIZED);
        }
        if (!response.ok) throw new Error(dict.errors.loadFailed);
        const data = (await response.json()) as { bookings: Booking[] };
        setBookings(data.bookings);
        setState("ready");
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : dict.errors.loadFailed);
        setState("error");
      }
    },
    [dict],
  );

  function applyFilters(next: BookingFilters) {
    setFilters(next);
    void load(next);
  }

  /** Cancelling or moving a booking changes which dates have free slots. */
  const refreshCalendar = React.useCallback(async () => {
    try {
      const response = await fetch("/api/availability", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as { calendar: CalendarDay[] };
      setCalendar(data.calendar);
    } catch {
      // A stale date list is harmless: the server revalidates every move.
    }
  }, []);

  /** Sends one admin action, then reloads so the table and tiles stay truthful. */
  const mutate = React.useCallback(
    async (
      id: string,
      body: Record<string, unknown>,
    ): Promise<BookingMutationResult> => {
      try {
        const response = await fetch(`/api/bookings/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const error = (await response
            .json()
            .catch(() => null)) as BookingErrorBody | null;
          const code = error?.code as BookingErrorCode | undefined;
          return {
            ok: false,
            message: (code && dict.errors[code]) || dict.errors.genericRetry,
          };
        }

        await load(filters);
        await refreshCalendar();
        return { ok: true };
      } catch {
        return { ok: false, message: dict.booking.networkError };
      }
    },
    [filters, load, refreshCalendar, dict],
  );

  const summary = summarise(bookings, today);
  const hasFilters = Boolean(filters.date || filters.level || filters.status);

  return (
    <div className="space-y-6">
      {state === "ready" && (
        <dl className="grid gap-3 sm:grid-cols-3">
          {[
            { label: dict.admin.tiles.classesToday, value: summary.today },
            { label: dict.admin.tiles.upcomingClasses, value: summary.upcoming },
            { label: dict.admin.tiles.bookingsInView, value: summary.total },
          ].map((tile) => (
            <div
              key={tile.label}
              className="rounded-lg border border-border p-4"
            >
              <dt className="text-sm text-muted-foreground">{tile.label}</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">
                {tile.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <BookingFiltersBar
        filters={filters}
        onChange={applyFilters}
        disabled={state === "loading"}
      />

      <section
        aria-labelledby="results-heading"
        aria-busy={state === "loading"}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id="results-heading" className="text-sm font-medium">
            {dict.admin.list.heading}
          </h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void load(filters)}
            disabled={state === "loading"}
          >
            <RefreshCw aria-hidden="true" />
            {dict.admin.list.refresh}
          </Button>
        </div>

        {state === "loading" && (
          <div className="space-y-2">
            <span className="sr-only" role="status">
              {dict.admin.list.loading}
            </span>
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        )}

        {state === "error" && (
          <div
            role="alert"
            className="flex flex-col items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-sm"
          >
            <p className="flex items-start gap-2 text-destructive">
              <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              {errorMessage}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void load(filters)}
            >
              <RefreshCw aria-hidden="true" />
              {dict.common.tryAgain}
            </Button>
          </div>
        )}

        {state === "ready" && bookings.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border p-10 text-center">
            <CalendarSearch
              aria-hidden="true"
              className="size-6 text-muted-foreground"
            />
            <div>
              <p className="font-medium">{dict.admin.list.emptyTitle}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {hasFilters ? dict.admin.list.emptyFiltered : dict.admin.list.emptyUnfiltered}
              </p>
            </div>
            {hasFilters && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyFilters({})}
              >
                {dict.admin.filters.clear}
              </Button>
            )}
          </div>
        )}

        {state === "ready" && bookings.length > 0 && (
          <BookingsTable bookings={bookings} onInspect={setSelected} />
        )}
      </section>

      <BookingDetailModal
        booking={selected}
        calendar={calendar}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        onCancelBooking={(id) => mutate(id, { action: "cancel" })}
        onRescheduleBooking={(
          id,
          target: { date: IsoDate; timeSlot: TimeSlotId },
        ) => mutate(id, { action: "reschedule", ...target })}
      />
    </div>
  );
}
