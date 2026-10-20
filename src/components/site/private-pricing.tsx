"use client";

import { PrivatePlans } from "@/components/booking/private-plans";
import { requestPrivatePackage } from "@/components/booking/private-package-request";
import { I18nProvider } from "@/lib/i18n/i18n-context";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { Locale } from "@/lib/i18n/locale";

/** Landing-page pricing cards; choosing one opens the booking flow at that package. */
export function PrivatePricing({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  return (
    <I18nProvider locale={locale} dict={dict}>
      <PrivatePlans value={null} onSelect={requestPrivatePackage} showHeading={false} />
    </I18nProvider>
  );
}
