"use client";

import * as React from "react";
import { KeyRound, Loader2 } from "lucide-react";

import { loadSavedPackage } from "@/components/booking/saved-package";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BookingErrorBody, BookingErrorCode } from "@/lib/booking/errors";
import type { PackageLookup } from "@/lib/booking/types";
import { packageLookupSchema } from "@/lib/booking/validation";
import { useI18n } from "@/lib/i18n/i18n-context";

/**
 * "Already have a private package?" — checks the code and WhatsApp number with
 * the server, then hands the package to the booking flow so the next session
 * is booked without paying again.
 */
export function PackageCodeForm({
  onApplied,
}: {
  onApplied: (pkg: PackageLookup, whatsappNumber: string) => void;
}) {
  const { dict } = useI18n();
  const t = dict.booking.package;
  // Prefilled from the last package used in this browser. This form is only
  // ever rendered after a click in the browser, never on the server.
  const [packageCode, setPackageCode] = React.useState(
    () => loadSavedPackage()?.packageCode ?? "",
  );
  const [whatsappNumber, setWhatsappNumber] = React.useState(
    () => loadSavedPackage()?.whatsappNumber ?? "",
  );
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = packageLookupSchema.safeParse({ packageCode, whatsappNumber });
    if (!parsed.success) {
      setError(t.invalid);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/packages/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (response.ok) {
        onApplied((await response.json()) as PackageLookup, parsed.data.whatsappNumber as string);
        return;
      }
      const body = (await response.json().catch(() => null)) as BookingErrorBody | null;
      const code = body?.code as BookingErrorCode | undefined;
      setError((code && dict.errors[code]) || dict.errors.genericRetry);
    } catch {
      setError(dict.booking.networkError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={(event) => void submit(event)}
      aria-labelledby="package-code-heading"
      className="glass-card mb-8 rounded-2xl p-5"
      noValidate
    >
      <h4
        id="package-code-heading"
        className="flex items-center gap-2 text-base font-semibold tracking-tight"
      >
        <KeyRound aria-hidden="true" className="size-4 text-primary" />
        {t.heading}
      </h4>
      <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="packageCode">{t.codeLabel}</Label>
          <Input
            id="packageCode"
            name="packageCode"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={32}
            placeholder="PKG-XXXXXX"
            className="font-mono uppercase"
            value={packageCode}
            aria-invalid={Boolean(error)}
            onChange={(event) => {
              setPackageCode(event.target.value);
              setError(null);
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="packageWhatsapp">{t.whatsappLabel}</Label>
          <Input
            id="packageWhatsapp"
            name="packageWhatsapp"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={32}
            placeholder="0812 3456 7890"
            value={whatsappNumber}
            aria-invalid={Boolean(error)}
            onChange={(event) => {
              setWhatsappNumber(event.target.value);
              setError(null);
            }}
          />
        </div>
        <Button type="submit" size="lg" disabled={busy} className="h-9 px-4">
          {busy && <Loader2 aria-hidden="true" className="animate-spin" />}
          {busy ? t.checking : t.submit}
        </Button>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
