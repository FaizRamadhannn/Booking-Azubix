"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { isLocale, LOCALE_COOKIE } from "./locale";

/** One year — a language choice should stick around like any other preference. */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Persists the chosen language and forces every Server Component to re-render
 * with it. Client Component state further down the tree (the booking flow's
 * current step, entered form values, etc.) is untouched — only the props
 * carrying translated text change, so switching language mid-booking never
 * loses progress.
 */
export async function setLocale(formData: FormData): Promise<void> {
  const value = formData.get("locale");
  if (!isLocale(value)) return;

  (await cookies()).set(LOCALE_COOKIE, value, {
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");
}
