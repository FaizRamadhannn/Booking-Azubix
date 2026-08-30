import type { Dictionary } from "./dictionaries/en";

/**
 * Turns a list of invalid field names into localised messages, without ever
 * displaying the raw English text a Zod schema or the server attaches to its
 * own error objects. Each field in this form has exactly one plausible
 * failure reason, so one fixed message per field is enough — no need to
 * parse Zod issue codes or the server's internal wording.
 */
export function localizeFieldErrors(
  dict: Dictionary,
  fieldNames: Iterable<string>,
): Record<string, string> {
  const messages = dict.booking.details.fieldErrors;
  const result: Record<string, string> = {};
  for (const field of fieldNames) {
    result[field] =
      (messages as Record<string, string>)[field] ?? messages.generic;
  }
  return result;
}
