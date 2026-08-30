"use client";

import * as React from "react";

import type { Dictionary } from "./dictionaries/en";
import type { Locale } from "./locale";

interface I18nValue {
  locale: Locale;
  dict: Dictionary;
}

const I18nContext = React.createContext<I18nValue | null>(null);

/**
 * Seeds the client subtree with the locale/dictionary resolved server-side.
 * Placed at the root of each independent Client Component tree (the booking
 * flow, the admin dashboard) so descendants can call {@link useI18n} without
 * threading `dict` through every prop list by hand.
 */
export function I18nProvider({
  locale,
  dict,
  children,
}: React.PropsWithChildren<I18nValue>) {
  const value = React.useMemo(() => ({ locale, dict }), [locale, dict]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = React.useContext(I18nContext);
  if (!value) {
    throw new Error("useI18n() must be called within an <I18nProvider>.");
  }
  return value;
}
