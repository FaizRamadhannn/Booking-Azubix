"use client";

import * as React from "react";
import { AlertCircle, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

import { BookingSummary } from "@/components/booking/booking-summary";
import { DateStep } from "@/components/booking/date-step";
import {
  DetailsStep,
  type StudentDetails,
} from "@/components/booking/details-step";
import { LevelStep } from "@/components/booking/level-step";
import { SuccessPanel } from "@/components/booking/success-panel";
import { BOOKING_STEPS, Stepper, type BookingStepId } from "@/components/booking/stepper";
import { TimeStep, type LoadState } from "@/components/booking/time-step";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { BookingErrorBody } from "@/lib/booking/errors";
import type {
  Booking,
  CalendarDay,
  ClassLevel,
  DayAvailability,
  IsoDate,
  TimeSlotId,
} from "@/lib/booking/types";
import { createBookingSchema } from "@/lib/booking/validation";
import { localizeFieldErrors } from "@/lib/i18n/field-errors";
import { format } from "@/lib/i18n/get-dictionary";
import { I18nProvider, useI18n } from "@/lib/i18n/i18n-context";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { Locale } from "@/lib/i18n/locale";

const EMPTY_DETAILS: StudentDetails = {
  studentName: "",
  whatsappGroupName: "",
  lastMaterial: "",
};

type Step = BookingStepId | "success";

export function BookingFlow({
  initialCalendar,
  dict,
  locale,
}: {
  initialCalendar: CalendarDay[];
  dict: Dictionary;
  locale: Locale;
}) {
  return (
    <I18nProvider locale={locale} dict={dict}>
      <BookingFlowInner initialCalendar={initialCalendar} />
    </I18nProvider>
  );
}

function BookingFlowInner({ initialCalendar }: { initialCalendar: CalendarDay[] }) {
  const { dict } = useI18n();
  const [calendar, setCalendar] = React.useState(initialCalendar);
  const [step, setStep] = React.useState<Step>("level");
  const [level, setLevel] = React.useState<ClassLevel | null>(null);
  const [date, setDate] = React.useState<IsoDate | null>(null);
  const [timeSlot, setTimeSlot] = React.useState<TimeSlotId | null>(null);
  const [details, setDetails] = React.useState<StudentDetails>(EMPTY_DETAILS);

  const [availability, setAvailability] =
    React.useState<DayAvailability | null>(null);
  const [availabilityState, setAvailabilityState] =
    React.useState<LoadState>("ready");

  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>(
    {},
  );
  const [formError, setFormError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [booking, setBooking] = React.useState<Booking | null>(null);

  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const hasMounted = React.useRef(false);

  // Move focus to the step heading on every transition so keyboard and screen
  // reader users are not stranded at the top of the page.
  React.useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const loadDay = React.useCallback(async (target: IsoDate) => {
    setAvailabilityState("loading");
    try {
      const response = await fetch(`/api/availability/${target}`, {
        cache: "no-store",
      });
      if (!response.ok)
        throw new Error(`Request failed with ${response.status}`);
      setAvailability((await response.json()) as DayAvailability);
      setAvailabilityState("ready");
    } catch {
      setAvailability(null);
      setAvailabilityState("error");
    }
  }, []);

  const refreshCalendar = React.useCallback(async () => {
    try {
      const response = await fetch("/api/availability", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as { calendar: CalendarDay[] };
      setCalendar(data.calendar);
    } catch {
      // A stale calendar is harmless: the server revalidates every booking.
    }
  }, []);

  function selectLevel(next: ClassLevel) {
    setLevel(next);
    setFormError(null);
    setStep("date");
  }

  function selectDate(next: IsoDate) {
    setDate(next);
    setTimeSlot(null);
    setFormError(null);
    setStep("time");
    void loadDay(next);
  }

  function selectTimeSlot(next: TimeSlotId) {
    setTimeSlot(next);
    setFieldErrors((current) => {
      const rest = { ...current };
      delete rest.timeSlot;
      return rest;
    });
    setFormError(null);
    setStep("details");
  }

  function goBack() {
    setFormError(null);
    const index = BOOKING_STEPS.indexOf(step as BookingStepId);
    if (index > 0) setStep(BOOKING_STEPS[index - 1]);
  }

  /** Runs the shared schema on the client so mistakes surface before any request. */
  function submitDetails() {
    const result = createBookingSchema.safeParse({
      ...details,
      level,
      date,
      timeSlot,
    });
    if (!result.success) {
      const fields = result.error.issues.map((issue) => String(issue.path[0] ?? "form"));
      setFieldErrors(localizeFieldErrors(dict, fields));
      return;
    }
    setFieldErrors({});
    setStep("review");
  }

  async function confirmBooking() {
    if (!level || !date || !timeSlot) return;
    setSubmitting(true);
    setFormError(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...details, level, date, timeSlot }),
      });

      if (response.ok) {
        setBooking((await response.json()) as Booking);
        setStep("success");
        void refreshCalendar();
        return;
      }

      const error = (await response.json()) as BookingErrorBody;
      setFieldErrors(localizeFieldErrors(dict, Object.keys(error.fieldErrors ?? {})));
      setFormError(dict.errors[error.code] ?? dict.errors.INTERNAL);

      // The slot was taken or expired between review and confirm: send the
      // student back to a freshly loaded list of times rather than looping.
      if (error.code === "SLOT_TAKEN" || error.code === "SLOT_EXPIRED") {
        setTimeSlot(null);
        setStep("time");
        void loadDay(date);
        void refreshCalendar();
      } else if (
        error.code === "PAST_DATE" ||
        error.code === "WEEKEND" ||
        error.code === "OUTSIDE_BOOKING_WINDOW"
      ) {
        setStep("date");
        void refreshCalendar();
      } else if (error.fieldErrors && Object.keys(error.fieldErrors).length > 0) {
        setStep("details");
      }
    } catch {
      setFormError(dict.booking.networkError);
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setStep("level");
    setLevel(null);
    setDate(null);
    setTimeSlot(null);
    setDetails(EMPTY_DETAILS);
    setAvailability(null);
    setAvailabilityState("ready");
    setFieldErrors({});
    setFormError(null);
    setBooking(null);
    void refreshCalendar();
  }

  const canGoBack = step !== "level" && step !== "success";

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        {step !== "success" && (
          <div className="mb-6">
            <Stepper current={step} />
          </div>
        )}

        <h3 ref={headingRef} tabIndex={-1} className="sr-only">
          {step === "success"
            ? dict.booking.stepper.srBookingConfirmed
            : format(dict.booking.stepper.srStepPrefix, {
                step: dict.booking.stepper.steps[step as BookingStepId],
              })}
        </h3>

        {formError && step !== "success" && (
          <p
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          >
            <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {formError}
          </p>
        )}

        {step === "level" && <LevelStep value={level} onSelect={selectLevel} />}

        {step === "date" && (
          <DateStep calendar={calendar} value={date} onSelect={selectDate} />
        )}

        {step === "time" && date && (
          <TimeStep
            date={date}
            availability={availability}
            state={availabilityState}
            value={timeSlot}
            onSelect={selectTimeSlot}
            onRetry={() => void loadDay(date)}
          />
        )}

        {step === "details" && (
          <DetailsStep
            value={details}
            errors={fieldErrors}
            onChange={(patch) => {
              setDetails((current) => ({ ...current, ...patch }));
              setFieldErrors((current) => {
                const next = { ...current };
                for (const key of Object.keys(patch)) delete next[key];
                return next;
              });
            }}
          />
        )}

        {step === "review" && level && date && timeSlot && (
          <div>
            <h4 className="text-base font-semibold tracking-tight">
              {dict.booking.review.heading}
            </h4>
            <p className="mt-1 text-sm text-muted-foreground">
              {dict.booking.review.subtext}
            </p>
            <div className="mt-4">
              <BookingSummary booking={{ ...details, level, date, timeSlot }} />
            </div>
          </div>
        )}

        {step === "success" && booking && (
          <SuccessPanel booking={booking} onBookAgain={reset} />
        )}

        {step !== "success" && (
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={goBack}
              disabled={!canGoBack || submitting}
              className={canGoBack ? undefined : "invisible"}
            >
              <ArrowLeft aria-hidden="true" />
              {dict.common.back}
            </Button>

            {step === "details" && (
              <Button type="button" size="lg" onClick={submitDetails}>
                {dict.booking.buttons.reviewBooking}
                <ArrowRight aria-hidden="true" />
              </Button>
            )}

            {step === "review" && (
              <Button
                type="button"
                size="lg"
                onClick={() => void confirmBooking()}
                disabled={submitting}
              >
                {submitting && <Loader2 aria-hidden="true" className="animate-spin" />}
                {submitting ? dict.booking.buttons.confirming : dict.booking.buttons.confirmBooking}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
