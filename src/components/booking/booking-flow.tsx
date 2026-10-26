"use client";

import * as React from "react";
import { AlertCircle, ArrowLeft, ArrowRight, KeyRound } from "lucide-react";

import { DateStep } from "@/components/booking/date-step";
import {
  DetailsStep,
  type StudentDetails,
} from "@/components/booking/details-step";
import { LevelStep } from "@/components/booking/level-step";
import { PaymentStep } from "@/components/booking/payment-step";
import { onPrivatePackageRequest } from "@/components/booking/private-package-request";
import { savePackage } from "@/components/booking/saved-package";
import { SuccessPanel } from "@/components/booking/success-panel";
import { BOOKING_STEPS, Stepper, type BookingStepId } from "@/components/booking/stepper";
import { TimeStep, type LoadState } from "@/components/booking/time-step";
import { TypeStep } from "@/components/booking/type-step";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { BookingErrorBody, BookingErrorCode } from "@/lib/booking/errors";
import type {
  Booking,
  BookingType,
  CalendarDay,
  ClassLevel,
  DayAvailability,
  IsoDate,
  PackageLookup,
  TimeSlotId,
} from "@/lib/booking/types";
import { PAYMENT_HOLD_MINUTES } from "@/lib/booking/constants";
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
  whatsappNumber: "",
};

/** A paid package the student is booking this session from. */
type ActivePackage = PackageLookup & { whatsappNumber: string };

const PACKAGE_ERROR_CODES: BookingErrorCode[] = [
  "PACKAGE_NOT_FOUND",
  "PACKAGE_NOT_CONFIRMED",
  "PACKAGE_USED_UP",
];

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
  const [step, setStep] = React.useState<Step>("type");
  const [bookingType, setBookingType] = React.useState<BookingType | null>(null);
  const [level, setLevel] = React.useState<ClassLevel | null>(null);
  const [date, setDate] = React.useState<IsoDate | null>(null);
  const [timeSlot, setTimeSlot] = React.useState<TimeSlotId | null>(null);
  const [details, setDetails] = React.useState<StudentDetails>(EMPTY_DETAILS);
  const [activePackage, setActivePackage] = React.useState<ActivePackage | null>(null);

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
  const submitLock = React.useRef(false);

  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const hasMounted = React.useRef(false);
  /** Set when a step change came from outside the card and should bring it into view. */
  const scrollIntoViewOnStep = React.useRef(false);
  /** Set when the student asked to enter a package code: focus that field instead. */
  const focusPackageCodeOnStep = React.useRef(false);

  // Move focus to the step heading on every transition so keyboard and screen
  // reader users are not stranded at the top of the page.
  React.useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    if (focusPackageCodeOnStep.current) {
      focusPackageCodeOnStep.current = false;
      const field = document.getElementById("packageCode");
      field?.focus({ preventScroll: true });
      field?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (scrollIntoViewOnStep.current) {
      scrollIntoViewOnStep.current = false;
      headingRef.current?.focus({ preventScroll: true });
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  // A package picked on the landing page's pricing cards jumps straight to the
  // date step. Ignored while a slot is held for payment or once it is booked.
  const stepRef = React.useRef(step);
  React.useEffect(() => {
    stepRef.current = step;
  }, [step]);
  React.useEffect(
    () =>
      onPrivatePackageRequest((next) => {
        // A slot is already held or booked: don't throw that away, just show it.
        if (stepRef.current === "payment" || stepRef.current === "success") {
          cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
        // Already on the date step, so the step effect won't fire to scroll.
        if (stepRef.current === "date") {
          cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        setBookingType("PRIVATE");
        setActivePackage(null);
        setLevel(next);
        setDate(null);
        setTimeSlot(null);
        setFormError(null);
        setStep("date");
        scrollIntoViewOnStep.current = stepRef.current !== "date";
      }),
    [],
  );

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

  function selectBookingType(next: BookingType) {
    setBookingType(next);
    if (next !== "PRIVATE") setActivePackage(null);
    setFormError(null);
    setStep("level");
  }

  function selectLevel(next: ClassLevel) {
    // Picking a package card means buying a new one.
    setActivePackage(null);
    setLevel(next);
    setFormError(null);
    setStep("date");
  }

  /** The student owns a paid package: book from it, the level is the package's. */
  function applyPackage(pkg: PackageLookup, whatsappNumber: string) {
    setActivePackage({ ...pkg, whatsappNumber });
    setBookingType("PRIVATE");
    setLevel(pkg.level);
    setDetails((current) => ({
      ...current,
      studentName: current.studentName || pkg.studentName,
      whatsappGroupName: current.whatsappGroupName || pkg.whatsappGroupName,
      whatsappNumber,
    }));
    setFormError(null);
    setStep("date");
  }

  /**
   * A private student who arrived without using their code (e.g. from the
   * landing page's pricing cards) goes back to the package code form.
   */
  function goToPackageCode() {
    setFormError(null);
    focusPackageCodeOnStep.current = true;
    setStep("level");
  }

  function dropPackage() {
    setActivePackage(null);
    setLevel(null);
    setFormError(null);
    setStep("level");
  }

  /** Everything the server needs for this booking. */
  function bookingPayload() {
    return {
      ...details,
      whatsappNumber: bookingType === "PRIVATE" ? details.whatsappNumber : "",
      packageCode: activePackage?.packageCode ?? "",
      bookingType,
      level,
      date,
      timeSlot,
    };
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
    const result = createBookingSchema.safeParse(bookingPayload());
    if (!result.success) {
      const fields = result.error.issues.map((issue) => String(issue.path[0] ?? "form"));
      setFieldErrors(localizeFieldErrors(dict, fields));
      return;
    }
    setFieldErrors({});
    void createBooking();
  }

  /**
   * Creates the booking as an UNPAID hold, so the slot is ours and a payment
   * code exists *before* the student transfers any money.
   */
  async function createBooking() {
    if (submitLock.current || !bookingType || !level || !date || !timeSlot) return;
    const result = createBookingSchema.safeParse(bookingPayload());
    if (!result.success) {
      const fields = result.error.issues.map((issue) => String(issue.path[0] ?? "form"));
      setFieldErrors(localizeFieldErrors(dict, fields));
      setStep("details");
      setFormError(dict.booking.payment.invalidError);
      return;
    }

    submitLock.current = true;
    setSubmitting(true);
    setFormError(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload()),
      });

      if (response.ok) {
        const created = (await response.json()) as Booking;
        setBooking(created);
        // A session from a paid package is booked as paid: nothing to pay.
        if (activePackage && created.paymentStatus === "CONFIRMED") {
          savePackage({
            packageCode: activePackage.packageCode,
            whatsappNumber: activePackage.whatsappNumber,
          });
          setStep("success");
        } else {
          setStep("payment");
        }
        void refreshCalendar();
        return;
      }

      const error = (await response.json()) as BookingErrorBody;
      if (PACKAGE_ERROR_CODES.includes(error.code)) {
        setFormError(dict.errors[error.code]);
        setActivePackage(null);
        setLevel(null);
        setStep("level");
        return;
      }
      if (error.code === "RATE_LIMITED") {
        setFormError(dict.errors.RATE_LIMITED);
        return;
      }
      if (error.code === "DATE_CLOSED") {
        setFormError(dict.errors.DATE_CLOSED);
        setTimeSlot(null);
        setStep("date");
        void refreshCalendar();
        return;
      }
      setFieldErrors(localizeFieldErrors(dict, Object.keys(error.fieldErrors ?? {})));
      setFormError(
        error.code === "SLOT_TAKEN" || error.code === "SLOT_EXPIRED"
          ? dict.booking.payment.slotError
          : error.code === "VALIDATION_FAILED"
            ? dict.booking.payment.invalidError
            : dict.booking.payment.genericError,
      );

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
      submitLock.current = false;
    }
  }

  /** The hold ran out: the server has released (or will release) the slot. */
  function paymentExpired() {
    setFormError(
      format(dict.booking.payment.expiredError, { minutes: PAYMENT_HOLD_MINUTES }),
    );
    setBooking(null);
    setTimeSlot(null);
    setStep("time");
    if (date) void loadDay(date);
    void refreshCalendar();
  }

  async function reportPaid(payerName: string) {
    if (submitLock.current || !booking?.paymentCode) return;
    submitLock.current = true;
    setSubmitting(true);
    setFormError(null);

    try {
      const response = await fetch(`/api/bookings/${booking.id}/paid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentCode: booking.paymentCode, payerName }),
      });

      if (response.ok) {
        const paid = (await response.json()) as Booking;
        setBooking(paid);
        if (paid.privatePackage && paid.whatsappNumber) {
          savePackage({
            packageCode: paid.privatePackage.packageCode,
            whatsappNumber: paid.whatsappNumber,
          });
        }
        setStep("success");
        return;
      }

      const error = (await response.json()) as BookingErrorBody;
      if (error.code === "PAYMENT_EXPIRED" || error.code === "NOT_FOUND") {
        paymentExpired();
      } else if (error.code === "RATE_LIMITED") {
        setFormError(dict.errors.RATE_LIMITED);
      } else if (error.code === "VALIDATION_FAILED") {
        setFormError(dict.booking.payment.payerNameError);
      } else {
        setFormError(dict.booking.payment.genericError);
      }
    } catch {
      setFormError(dict.booking.networkError);
    } finally {
      setSubmitting(false);
      submitLock.current = false;
    }
  }

  function reset() {
    setStep("type");
    setBookingType(null);
    setLevel(null);
    setDate(null);
    setTimeSlot(null);
    setDetails(EMPTY_DETAILS);
    setActivePackage(null);
    setAvailability(null);
    setAvailabilityState("ready");
    setFieldErrors({});
    setFormError(null);
    setBooking(null);
    void refreshCalendar();
  }

  // On the payment step the slot is already held; leaving would orphan it, so
  // the only ways out are paying or letting the hold run out.
  const canGoBack = step !== "type" && step !== "payment" && step !== "success";

  return (
    <Card ref={cardRef} className="glass-card scroll-mt-20 overflow-hidden rounded-3xl ring-0">
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

        {activePackage && step !== "success" && step !== "type" && step !== "level" && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/30 bg-primary/10 p-3 text-sm">
            <p className="flex items-start gap-2">
              <KeyRound aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>
                <span className="font-medium">
                  {format(dict.booking.package.active, {
                    code: activePackage.packageCode,
                    level: activePackage.level,
                    remaining: activePackage.sessionsTotal - activePackage.sessionsUsed,
                    total: activePackage.sessionsTotal,
                  })}
                </span>{" "}
                <span className="text-muted-foreground">{dict.booking.package.activeHint}</span>
              </span>
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={dropPackage}
              disabled={submitting}
            >
              {dict.booking.package.remove}
            </Button>
          </div>
        )}

        {bookingType === "PRIVATE" &&
          !activePackage &&
          (step === "date" || step === "time" || step === "details") && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-muted/40 p-3 text-sm">
              <p className="flex items-start gap-2">
                <KeyRound aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>
                  <span className="font-medium">{dict.booking.package.heading}</span>{" "}
                  <span className="text-muted-foreground">{dict.booking.package.reminder}</span>
                </span>
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={goToPackageCode}
                disabled={submitting}
              >
                {dict.booking.package.enterCode}
              </Button>
            </div>
          )}

        {formError && step !== "success" && (
          <p
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
          >
            <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {formError}
          </p>
        )}

        {step === "type" && (
          <TypeStep value={bookingType} onSelect={selectBookingType} />
        )}

        {step === "level" && bookingType && (
          <LevelStep
            bookingType={bookingType}
            value={level}
            onSelect={selectLevel}
            onPackageApplied={applyPackage}
          />
        )}

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
            askWhatsappNumber={bookingType === "PRIVATE"}
            lockWhatsappNumber={activePackage !== null}
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

        {step === "payment" && booking && (
          <PaymentStep
            booking={booking}
            busy={submitting}
            onConfirm={(payerName) => void reportPaid(payerName)}
            onExpired={paymentExpired}
          />
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
              <Button
                type="button"
                size="lg"
                onClick={submitDetails}
                disabled={submitting}
                className="h-11 rounded-full px-6 font-semibold hover:bg-primary/90 hover:shadow-[0_0_20px_rgb(255_107_0/40%)]"
              >
                {activePackage
                  ? submitting
                    ? dict.booking.package.booking
                    : dict.booking.package.bookButton
                  : submitting
                    ? dict.booking.payment.creating
                    : dict.booking.buttons.reviewBooking}
                <ArrowRight aria-hidden="true" />
              </Button>
            )}

          </div>
        )}
      </CardContent>
    </Card>
  );
}
