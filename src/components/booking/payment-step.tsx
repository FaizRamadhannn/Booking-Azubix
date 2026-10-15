"use client";

import Image from "next/image";
import { Loader2 } from "lucide-react";

import qrisImage from "@/components/payment/Qris.webp";
import { Button } from "@/components/ui/button";
import { findTimeSlot, formatLongDate } from "@/lib/booking/datetime";
import type { ClassLevel, IsoDate, TimeSlotId } from "@/lib/booking/types";
import { useI18n } from "@/lib/i18n/i18n-context";
import { intlTag } from "@/lib/i18n/locale";
import type { StudentDetails } from "./details-step";

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PaymentStep({
  level,
  date,
  timeSlot,
  details,
  price,
  busy,
  onConfirm,
}: {
  level: ClassLevel;
  date: IsoDate;
  timeSlot: TimeSlotId;
  details: StudentDetails;
  price: number;
  busy: boolean;
  onConfirm: () => void;
}) {
  const { dict, locale } = useI18n();
  const t = dict.booking.payment;
  const slot = findTimeSlot(timeSlot);

  return (
    <div>
      <section
        aria-labelledby="qris-heading"
        className="relative isolate -mx-4 -mt-4 overflow-hidden bg-gradient-to-br from-[#073b73] via-[#0d5c99] to-[#1674ad] px-4 py-6 text-white sm:-mx-6 sm:-mt-6 sm:px-6 sm:py-8"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-2/5 bg-white/[0.045] [clip-path:polygon(45%_0,100%_0,100%_100%,0_100%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-1/5 bg-cyan-200/[0.07] [clip-path:polygon(70%_0,100%_0,100%_100%,0_100%)]"
        />

        <div className="relative mx-auto max-w-xl text-center">
          <span className="inline-flex rounded-sm bg-white px-2.5 py-1 text-sm font-bold text-[#0b5794]">
            QRIS
          </span>
          <h4 id="qris-heading" className="mt-3 text-xl font-semibold">
            {t.heading}
          </h4>
          <p className="mt-2 text-sm text-cyan-50">Level {level}</p>
          <p className="mt-1 text-3xl font-bold tabular-nums sm:text-4xl">
            {formatRupiah(price)}
          </p>
          <p className="mt-1 text-xs text-cyan-100">{t.amountLabel}</p>

          <div className="mx-auto mt-5 max-w-[22rem] rounded-xl bg-white p-3 shadow-lg sm:p-4">
            <Image
              src={qrisImage}
              alt={t.qrisAlt}
              priority
              sizes="(max-width: 640px) calc(100vw - 56px), 320px"
              className="h-auto w-full object-contain"
            />
          </div>

          <p className="mx-auto mt-4 max-w-md text-sm font-medium text-white">
            {t.scanInstruction}
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-cyan-100">
            {t.amountInstruction}
          </p>
        </div>
      </section>

      <dl className="grid gap-x-6 gap-y-3 border-b border-border py-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">{t.studentName}</dt>
          <dd className="mt-0.5 font-medium">{details.studentName}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t.date}</dt>
          <dd className="mt-0.5 font-medium">{formatLongDate(date, intlTag(locale))}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t.time}</dt>
          <dd className="mt-0.5 font-medium tabular-nums">
            {slot ? `${slot.start} – ${slot.end}` : timeSlot}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t.whatsappGroup}</dt>
          <dd className="mt-0.5 break-words font-medium">{details.whatsappGroupName}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-muted-foreground">{t.lastMaterial}</dt>
          <dd className="mt-0.5 break-words font-medium">{details.lastMaterial}</dd>
        </div>
      </dl>

      <Button
        type="button"
        size="lg"
        onClick={onConfirm}
        disabled={busy}
        className="mt-5 w-full bg-amber-500 text-slate-950 hover:bg-amber-400 focus-visible:ring-amber-300"
      >
        {busy && <Loader2 aria-hidden="true" className="animate-spin" />}
        {busy ? t.processing : t.payButton}
      </Button>
    </div>
  );
}