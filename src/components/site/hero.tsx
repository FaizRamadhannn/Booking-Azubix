import { CalendarDays, Clock, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CLASS_LEVELS,
  TIMEZONE_LABEL,
  TIME_SLOTS,
} from "@/lib/booking/constants";
import { format } from "@/lib/i18n/get-dictionary";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

export function Hero({ dict }: { dict: Dictionary }) {
  const t = dict.hero;
  const facts = [
    {
      icon: CalendarDays,
      title: t.facts.weekdays.title,
      detail: t.facts.weekdays.detail,
    },
    {
      icon: Clock,
      title: format(t.facts.slots.title, { count: TIME_SLOTS.length }),
      detail: format(t.facts.slots.detail, {
        start: TIME_SLOTS[0].start,
        end: TIME_SLOTS[TIME_SLOTS.length - 1].end,
        timezone: TIMEZONE_LABEL,
      }),
    },
    {
      icon: Users,
      title: format(t.facts.levels.title, { levels: CLASS_LEVELS.join(", ") }),
      detail: t.facts.levels.detail,
    },
  ];

  return (
    <section className="border-b border-border bg-muted/30">
      <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {t.headline}
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground text-pretty">
          {t.subcopy}
        </p>

        <div className="mt-6">
          <Button render={<a href="#booking" />} nativeButton={false} size="lg">
            {t.cta}
          </Button>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-3">
          {facts.map((fact) => (
            <li key={fact.title} className="flex gap-3">
              <span
                aria-hidden="true"
                className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-primary"
              >
                <fact.icon className="size-4" />
              </span>
              <span>
                <span className="block text-sm font-medium">{fact.title}</span>
                <span className="block text-sm text-muted-foreground">
                  {fact.detail}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
