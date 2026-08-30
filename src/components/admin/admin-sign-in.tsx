"use client";

import * as React from "react";
import { useActionState } from "react";
import { AlertCircle, Eye, EyeOff, Lock } from "lucide-react";

import { signInAdmin, type AdminSignInState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n/i18n-context";

const INITIAL: AdminSignInState = { error: null };

export function AdminSignIn() {
  const { dict } = useI18n();
  const t = dict.admin.signIn;
  const [state, formAction, pending] = useActionState(signInAdmin, INITIAL);
  const [passwordVisible, setPasswordVisible] = React.useState(false);

  return (
    <form
      action={formAction}
      className="mx-auto w-full max-w-sm rounded-lg border border-border p-6"
    >
      <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
        <Lock aria-hidden="true" className="size-4" />
        {t.title}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>

      {state.error && (
        <p
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {t.errors[state.error]}
        </p>
      )}

      <div className="mt-5 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">{t.emailLabel}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            aria-invalid={Boolean(state.error)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">{t.passwordLabel}</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={passwordVisible ? "text" : "password"}
              autoComplete="current-password"
              required
              aria-invalid={Boolean(state.error)}
              className="pr-9"
            />
            <button
              type="button"
              onClick={() => setPasswordVisible((visible) => !visible)}
              aria-label={passwordVisible ? t.hidePassword : t.showPassword}
              aria-pressed={passwordVisible}
              className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {passwordVisible ? (
                <EyeOff aria-hidden="true" className="size-4" />
              ) : (
                <Eye aria-hidden="true" className="size-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <Button type="submit" className="mt-5 w-full" size="lg" disabled={pending}>
        {pending ? t.submitting : t.submit}
      </Button>
    </form>
  );
}
