import "server-only";

import { cookies } from "next/headers";

import { getDictionary } from "./get-dictionary";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "./locale";

/** The active locale for this request, read from the cookie the switcher sets. */
export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** Convenience: locale + its dictionary in one call, for Server Components. */
export async function getLocaleAndDictionary() {
  const locale = await getLocale();
  return { locale, dict: getDictionary(locale) };
}
