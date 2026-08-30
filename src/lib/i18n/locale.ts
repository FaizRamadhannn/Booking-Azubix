/** The only two UI languages this app supports. */
export const LOCALES = ["en", "de"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Cookie the chosen language is persisted in, read by every Server Component. */
export const LOCALE_COOKIE = "locale";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** BCP-47 tag used for `Intl`/`toLocaleDateString` calls in each language. */
const INTL_TAG: Record<Locale, string> = {
  en: "en-GB",
  de: "de-DE",
};

export function intlTag(locale: Locale): string {
  return INTL_TAG[locale];
}
