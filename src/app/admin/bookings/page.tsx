import type { Metadata } from "next";

import { signOutAdmin } from "@/app/admin/actions";
import { AdminSignIn } from "@/components/admin/admin-sign-in";
import { BookingsDashboard } from "@/components/admin/bookings-dashboard";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Button } from "@/components/ui/button";
import { getAdmin } from "@/lib/auth/admin";
import { TIMEZONE_LABEL } from "@/lib/booking/constants";
import { todayInZone } from "@/lib/booking/datetime";
import { getCalendar, listBookings } from "@/lib/booking/service";
import { format } from "@/lib/i18n/get-dictionary";
import { I18nProvider } from "@/lib/i18n/i18n-context";
import { getLocaleAndDictionary } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bookings — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminBookingsPage() {
  const { locale, dict } = await getLocaleAndDictionary();
  const admin = await getAdmin();

  // Nothing is queried until the caller is a known admin, so an unauthorised
  // request never causes booking data to be loaded at all.
  if (!admin) {
    return (
      <>
        <SiteHeader dict={dict} locale={locale} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
          <I18nProvider locale={locale} dict={dict}>
            <AdminSignIn />
          </I18nProvider>
        </main>
        <SiteFooter dict={dict} />
      </>
    );
  }

  const [bookings, calendar] = await Promise.all([listBookings(), getCalendar()]);

  return (
    <>
      <SiteHeader dict={dict} locale={locale} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {dict.admin.page.heading}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {format(dict.admin.page.subtext, { timezone: TIMEZONE_LABEL })}
            </p>
          </div>

          <form action={signOutAdmin} className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{admin.email}</span>
            <Button type="submit" variant="outline" size="sm">
              {dict.admin.page.signOut}
            </Button>
          </form>
        </div>

        <div className="mt-6">
          <BookingsDashboard
            today={todayInZone()}
            initialBookings={bookings}
            initialCalendar={calendar}
            dict={dict}
            locale={locale}
          />
        </div>
      </main>
      <SiteFooter dict={dict} />
    </>
  );
}
