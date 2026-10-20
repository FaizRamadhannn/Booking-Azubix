import { CalendarDays, Clock, QrCode, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/reveal";
import {
  CLASS_LEVELS,
  TIMEZONE_LABEL,
  TIME_SLOTS,
} from "@/lib/booking/constants";
import { format } from "@/lib/i18n/get-dictionary";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

/** Glowing hero plus the "benefits" tile row from the Stitch design. */
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
    {
      icon: QrCode,
      title: t.facts.qris.title,
      detail: t.facts.qris.detail,
    },
  ];

  return (
    <>
      <section className="relative isolate mx-auto w-full max-w-7xl px-4 pt-20 pb-16 text-center sm:px-6 sm:pt-28 lg:px-16">
        <div
          aria-hidden="true"
          className="orange-glow pointer-events-none absolute -top-20 left-1/2 -z-10 h-[600px] w-full -translate-x-1/2"
        />

        <p className="mb-8 inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-muted px-4 py-1.5">
          <span aria-hidden="true" className="size-2 animate-pulse rounded-full bg-primary" />
          <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            {t.badge}
          </span>
        </p>

        <div className="float-element">
          <h1 className="mx-auto max-w-4xl text-4xl leading-[1.1] font-bold tracking-[-0.04em] text-balance sm:text-6xl lg:text-7xl">
            {t.headline} <br className="hidden sm:block" />
            <span className="text-primary">{t.headlineAccent}</span>
          </h1>
        </div>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg">
          {t.subcopy}
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            render={<a href="#booking" />}
            nativeButton={false}
            className="h-14 w-full rounded-full px-8 text-base font-bold hover:bg-primary/90 active:scale-95 sm:w-auto"
          >
            {t.cta}
          </Button>
          <Button
            render={<a href="#private" />}
            nativeButton={false}
            variant="outline"
            className="h-14 w-full rounded-full border-foreground/20 bg-background/10 px-8 text-base font-bold backdrop-blur-sm hover:border-primary/50 sm:w-auto"
          >
            {t.ctaPrivate}
          </Button>
        </div>
      </section>

      <Reveal
        id="features"
        aria-label={dict.site.navFeatures}
        className="mx-auto w-full max-w-7xl scroll-mt-20 px-4 py-12 sm:px-6 lg:px-16"
      >
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((fact) => (
            <li key={fact.title} className="glass-card glass-hover flex flex-col items-start gap-4 p-8">
              <fact.icon aria-hidden="true" className="size-9 text-primary" strokeWidth={1.5} />
              <h2 className="text-xl font-medium tracking-tight">{fact.title}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{fact.detail}</p>
            </li>
          ))}
        </ul>
      </Reveal>
    </>
  );
}
