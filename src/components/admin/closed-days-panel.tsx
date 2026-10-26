"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CalendarOff, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatLongDate, isWeekend } from "@/lib/booking/datetime";
import type { BookingErrorBody } from "@/lib/booking/errors";
import type { ClosedDate, IsoDate } from "@/lib/booking/types";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { format } from "@/lib/i18n/get-dictionary";
import { intlTag, type Locale } from "@/lib/i18n/locale";

type Notice = { kind: "success" | "error"; text: string } | null;

/**
 * Lets the admin take a whole weekday off. The server refuses while any
 * student holds a slot on that day, so the admin never strands a booking.
 */
export function ClosedDaysPanel({
  today,
  initialClosedDays,
  dict,
  locale,
}: {
  today: IsoDate;
  initialClosedDays: ClosedDate[];
  dict: Dictionary;
  locale: Locale;
}) {
  const t = dict.admin.closedDays;
  const tag = intlTag(locale);
  const router = useRouter();
  const [closedDays, setClosedDays] = React.useState(initialClosedDays);
  const [date, setDate] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [busy, setBusy] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<Notice>(null);

  function errorText(code: string | undefined): string {
    const known = t.errors[code as keyof typeof t.errors];
    if (known) return known;
    if (code === "UNAUTHORIZED") return dict.errors.UNAUTHORIZED;
    return dict.errors.genericRetry;
  }

  async function send(
    request: Promise<Response>,
    key: string,
    successText: string,
  ): Promise<boolean> {
    setBusy(key);
    setNotice(null);
    try {
      const response = await request;
      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as BookingErrorBody | null;
        setNotice({ kind: "error", text: errorText(error?.code) });
        return false;
      }
      const data = (await response.json()) as { closedDays: ClosedDate[] };
      setClosedDays(data.closedDays);
      setNotice({ kind: "success", text: successText });
      // The booking dashboard's date list depends on closed days too.
      router.refresh();
      return true;
    } catch {
      setNotice({ kind: "error", text: dict.booking.networkError });
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function closeDay(event: React.FormEvent) {
    event.preventDefault();
    if (!date) {
      setNotice({ kind: "error", text: t.chooseDate });
      return;
    }
    if (isWeekend(date)) {
      setNotice({ kind: "error", text: t.errors.WEEKEND });
      return;
    }
    const ok = await send(
      fetch("/api/admin/closed-dates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, reason: reason.trim() || undefined }),
      }),
      "close",
      format(t.closedNotice, { date: formatLongDate(date, tag) }),
    );
    if (ok) {
      setDate("");
      setReason("");
    }
  }

  function reopen(day: IsoDate) {
    void send(
      fetch(`/api/admin/closed-dates?date=${encodeURIComponent(day)}`, { method: "DELETE" }),
      day,
      format(t.reopenedNotice, { date: formatLongDate(day, tag) }),
    );
  }

  return (
    <section aria-labelledby="closed-days-heading" className="glass-card rounded-2xl p-4 sm:p-6">
      <h2 id="closed-days-heading" className="text-lg font-semibold tracking-tight">
        {t.heading}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{t.subtext}</p>

      <form onSubmit={closeDay} className="mt-4 grid gap-3 sm:grid-cols-[12rem_1fr_auto] sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="closed-day-date">{t.dateLabel}</Label>
          <Input
            id="closed-day-date"
            type="date"
            min={today}
            value={date}
            disabled={busy !== null}
            onChange={(event) => setDate(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="closed-day-reason">{t.reasonLabel}</Label>
          <Input
            id="closed-day-reason"
            maxLength={120}
            placeholder={t.reasonPlaceholder}
            value={reason}
            disabled={busy !== null}
            onChange={(event) => setReason(event.target.value)}
          />
        </div>
        <Button type="submit" disabled={busy !== null}>
          <CalendarOff aria-hidden="true" />
          {busy === "close" ? t.submitting : t.submit}
        </Button>
      </form>

      {notice && (
        <p
          role={notice.kind === "error" ? "alert" : "status"}
          className={
            notice.kind === "error"
              ? "mt-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
              : "mt-3 flex items-start gap-2 rounded-lg border border-success/40 bg-success-muted p-3 text-sm text-success"
          }
        >
          {notice.kind === "error" ? (
            <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          ) : (
            <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          )}
          {notice.text}
        </p>
      )}

      <h3 className="mt-6 text-sm font-medium">{t.listHeading}</h3>
      {closedDays.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">{t.empty}</p>
      ) : (
        <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
          {closedDays.map((day) => (
            <li key={day.date} className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-medium">{formatLongDate(day.date, tag)}</p>
                <p className="text-xs text-muted-foreground">{day.reason ?? t.noReason}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy !== null}
                onClick={() => reopen(day.date)}
              >
                {busy === day.date ? t.reopening : t.reopen}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
