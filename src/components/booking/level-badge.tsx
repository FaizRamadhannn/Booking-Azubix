"use client";

import { useI18n } from "@/lib/i18n/i18n-context";
import { cn } from "@/lib/utils";
import type { ClassLevel } from "@/lib/booking/types";

/** Levels are distinguished by their own letters, so a neutral chip is enough. */
export function LevelBadge({
  level,
  className,
}: {
  level: ClassLevel;
  className?: string;
}) {
  const { dict } = useI18n();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-border bg-secondary px-2 py-0.5 font-mono text-xs font-semibold tracking-wide text-secondary-foreground",
        className,
      )}
    >
      <span className="sr-only">{dict.common.level} </span>
      {level}
    </span>
  );
}
