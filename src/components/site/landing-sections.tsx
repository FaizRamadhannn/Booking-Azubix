import { ChevronDown } from "lucide-react";

import { PrivatePricing } from "@/components/site/private-pricing";
import { Reveal } from "@/components/site/reveal";
import { Button } from "@/components/ui/button";
import { BOOKING_WINDOW_DAYS, PAYMENT_HOLD_MINUTES } from "@/lib/booking/constants";
import { format } from "@/lib/i18n/get-dictionary";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { Locale } from "@/lib/i18n/locale";

const SECTION = "mx-auto w-full max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 lg:px-16";

/** "Our Surgical Process" from the Stitch design: three numbered steps. */
export function ProcessSection({ dict }: { dict: Dictionary }) {
  const t = dict.landing.process;
  return (
    <Reveal id="process" aria-labelledby="process-heading" className="scroll-mt-16 bg-muted/30 py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-16">
        <div className="mb-16 text-center">
          <h2 id="process-heading" className="text-3xl font-semibold tracking-tight sm:text-5xl">
            {t.heading}
          </h2>
          <p className="mt-3 text-muted-foreground">{t.subtext}</p>
        </div>
        <ol className="relative grid grid-cols-1 gap-12 md:grid-cols-3">
          <span
            aria-hidden="true"
            className="absolute top-10 left-0 -z-10 hidden h-px w-full bg-foreground/5 md:block"
          />
          {t.steps.map((step, index) => (
            <li key={step.title} className="group text-center">
              <span className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full border border-foreground/10 bg-secondary text-2xl font-bold text-primary shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:border-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mb-3 text-xl font-medium tracking-tight">{step.title}</h3>
              <p className="mx-auto max-w-xs text-muted-foreground">{step.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </Reveal>
  );
}

/** "Select Your Tier" from the Stitch design, filled with the private packages. */
export function PrivateSection({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const t = dict.landing.private;
  return (
    <Reveal id="private" aria-labelledby="private-section-heading" className={SECTION}>
      <div className="mb-16 text-center">
        <p className="mb-3 text-xs font-medium tracking-widest text-primary uppercase">
          {t.eyebrow}
        </p>
        <h2 id="private-section-heading" className="text-3xl font-semibold tracking-tight sm:text-5xl">
          {t.heading}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{t.subtext}</p>
      </div>
      <PrivatePricing dict={dict} locale={locale} />
    </Reveal>
  );
}

/** "Common Inquiries": native disclosure widgets, so no client JS is needed. */
export function FaqSection({ dict }: { dict: Dictionary }) {
  const t = dict.landing.faq;
  return (
    <Reveal
      id="faq"
      aria-labelledby="faq-heading"
      className="mx-auto w-full max-w-3xl scroll-mt-20 px-4 py-20 sm:px-6"
    >
      <h2 id="faq-heading" className="mb-12 text-center text-3xl font-semibold tracking-tight sm:text-5xl">
        {t.heading}
      </h2>
      <div className="space-y-2">
        {t.items.map((item) => (
          <details key={item.question} className="group border-b border-foreground/10 pb-2">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-lg font-medium transition-colors hover:text-primary [&::-webkit-details-marker]:hidden">
              {item.question}
              <ChevronDown
                aria-hidden="true"
                className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
              />
            </summary>
            <p className="px-1 pb-4 leading-relaxed text-muted-foreground">
              {format(item.answer, { days: BOOKING_WINDOW_DAYS, minutes: PAYMENT_HOLD_MINUTES })}
            </p>
          </details>
        ))}
      </div>
    </Reveal>
  );
}

/** Closing call to action card with the bottom glow. */
export function CtaSection({ dict }: { dict: Dictionary }) {
  const t = dict.landing.cta;
  return (
    <Reveal aria-labelledby="cta-heading" className="mx-auto w-full max-w-7xl px-4 pt-12 pb-24 sm:px-6 lg:px-16">
      <div className="glass-card relative isolate overflow-hidden border-primary/30 px-6 py-16 text-center sm:px-16">
        <div
          aria-hidden="true"
          className="orange-glow pointer-events-none absolute -bottom-40 left-1/2 -z-10 h-[300px] w-full -translate-x-1/2 opacity-30"
        />
        <h2 id="cta-heading" className="mb-6 text-3xl font-bold tracking-tight sm:text-5xl">
          {t.heading}
        </h2>
        <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground">{t.subtext}</p>
        <Button
          render={<a href="#booking" />}
          nativeButton={false}
          className="h-14 rounded-full px-10 text-lg font-bold shadow-[0_0_30px_rgb(255_107_0/30%)] transition-transform hover:scale-105 hover:bg-primary"
        >
          {t.button}
        </Button>
      </div>
    </Reveal>
  );
}
