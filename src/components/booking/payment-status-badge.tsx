"use client";

import { BadgeCheck, Clock3 } from "lucide-react";

import type { PaymentStatus } from "@/lib/booking/types";
import { useI18n } from "@/lib/i18n/i18n-context";
import { cn } from "@/lib/utils";

export function PaymentStatusBadge({
  status,
  className,
}: {
  status: PaymentStatus;
  className?: string;
}) {
  const { dict } = useI18n();
  const Icon = status === "CONFIRMED" ? BadgeCheck : Clock3;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        status === "CONFIRMED"
          ? "border-success/40 bg-success-muted text-success"
          : "border-warning/40 bg-warning-muted text-warning",
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-3.5 shrink-0" />
      {dict.common.paymentStatus[status]}
    </span>
  );
}