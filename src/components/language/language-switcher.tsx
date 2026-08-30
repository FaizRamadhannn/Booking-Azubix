"use client";

import * as React from "react";

import { setLocale } from "@/lib/i18n/actions";
import type { Locale } from "@/lib/i18n/locale";

/**
 * A native `<select>` inside a Server Action form: works with JS disabled
 * (submit via the visually-hidden button) and, with JS, auto-submits on
 * change. Kept deliberately compact — "EN"/"DE" — so it never reintroduces
 * the header overflow fixed earlier for narrow phones.
 */
export function LanguageSwitcher({
  locale,
  label,
}: {
  locale: Locale;
  label: string;
}) {
  const formRef = React.useRef<HTMLFormElement>(null);
  const selectRef = React.useRef<HTMLSelectElement>(null);

  // The `locale` prop only changes once the Server Action's `revalidatePath`
  // has landed a fresh render — e.g. right after signing in — and in that
  // exact transition React's controlled `value` on a native `<select>` does
  // not reliably reach the DOM (verified: the underlying element keeps
  // showing the old option even though React's own state already reports the
  // new one). Writing `.value` on the element directly, imperatively, sidesteps
  // whatever part of that reconciliation is being skipped.
  React.useEffect(() => {
    if (selectRef.current && selectRef.current.value !== locale) {
      selectRef.current.value = locale;
    }
  }, [locale]);

  return (
    <form ref={formRef} action={setLocale}>
      <label className="sr-only" htmlFor="locale-switcher">
        {label}
      </label>
      <select
        ref={selectRef}
        id="locale-switcher"
        name="locale"
        defaultValue={locale}
        onChange={() => formRef.current?.requestSubmit()}
        className="h-7 rounded-md border border-border bg-background pl-1 pr-0.5 text-xs font-medium shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <option value="en">EN</option>
        <option value="de">DE</option>
      </select>
      <noscript>
        <button type="submit" className="sr-only">
          {label}
        </button>
      </noscript>
    </form>
  );
}
