import { de } from "./dictionaries/de";
import { en, type Dictionary } from "./dictionaries/en";
import type { Locale } from "./locale";

const DICTIONARIES: Record<Locale, Dictionary> = { en, de };

/** Both dictionaries are tiny and statically imported — no async loading needed. */
export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

/**
 * Fills `{placeholder}` tokens in a dictionary string. Kept deliberately
 * simple (no plural rules, no nesting) — this app's copy never needs more.
 */
export function format(template: string, values: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
