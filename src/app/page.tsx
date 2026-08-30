import { BookingFlow } from "@/components/booking/booking-flow";
import { BookingTerms } from "@/components/booking/booking-terms";
import { Hero } from "@/components/site/hero";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { TIMEZONE_LABEL } from "@/lib/booking/constants";
import { getCalendar } from "@/lib/booking/service";
import { format } from "@/lib/i18n/get-dictionary";
import { getLocaleAndDictionary } from "@/lib/i18n/server";

/** Availability depends on the current time in WIB, so the page is rendered per request. */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { locale, dict } = await getLocaleAndDictionary();
  // Resolved on the server: the first paint already shows real availability.
  const calendar = await getCalendar();

  return (
    <>
      <SiteHeader dict={dict} locale={locale} />
      <main className="flex-1">
        <Hero dict={dict} />

        <section
          id="booking"
          aria-labelledby="booking-heading"
          className="mx-auto w-full max-w-3xl scroll-mt-20 px-4 py-12 sm:px-6"
        >
          <h2
            id="booking-heading"
            className="text-2xl font-semibold tracking-tight"
          >
            {dict.booking.sectionHeading}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {format(dict.booking.sectionSubtext, { timezone: TIMEZONE_LABEL })}
          </p>

          <div className="mt-6">
            <BookingTerms dict={dict} />
          </div>

          <div className="mt-6">
            <BookingFlow initialCalendar={calendar} dict={dict} locale={locale} />
          </div>
        </section>
      </main>
      <SiteFooter dict={dict} />
    </>
  );
}
