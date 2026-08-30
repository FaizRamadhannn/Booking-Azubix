"use client";

import { AlertCircle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FIELD_LIMITS } from "@/lib/booking/constants";
import { useI18n } from "@/lib/i18n/i18n-context";

export interface StudentDetails {
  studentName: string;
  whatsappGroupName: string;
  lastMaterial: string;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="flex items-start gap-1.5 text-sm text-destructive">
      <AlertCircle aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
      {message}
    </p>
  );
}

export function DetailsStep({
  value,
  errors,
  onChange,
}: {
  value: StudentDetails;
  errors: Record<string, string>;
  onChange: (patch: Partial<StudentDetails>) => void;
}) {
  const { dict } = useI18n();
  const t = dict.booking.details;

  return (
    <fieldset className="space-y-4">
      <legend className="text-base font-semibold tracking-tight">{t.legend}</legend>
      <p className="-mt-3 text-sm text-muted-foreground">{t.description}</p>

      <div className="space-y-1.5">
        <Label htmlFor="studentName">{t.studentNameLabel}</Label>
        <Input
          id="studentName"
          name="studentName"
          autoComplete="name"
          required
          maxLength={FIELD_LIMITS.studentName.max}
          value={value.studentName}
          aria-invalid={Boolean(errors.studentName)}
          aria-describedby={
            errors.studentName ? "studentName-error" : undefined
          }
          onChange={(event) => onChange({ studentName: event.target.value })}
        />
        <FieldError id="studentName-error" message={errors.studentName} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="whatsappGroupName">{t.whatsappGroupLabel}</Label>
        <Input
          id="whatsappGroupName"
          name="whatsappGroupName"
          required
          maxLength={FIELD_LIMITS.whatsappGroupName.max}
          value={value.whatsappGroupName}
          aria-invalid={Boolean(errors.whatsappGroupName)}
          aria-describedby={
            errors.whatsappGroupName
              ? "whatsappGroupName-error"
              : "whatsappGroupName-hint"
          }
          onChange={(event) =>
            onChange({ whatsappGroupName: event.target.value })
          }
        />
        {!errors.whatsappGroupName && (
          <p
            id="whatsappGroupName-hint"
            className="text-xs text-muted-foreground"
          >
            {t.whatsappGroupHint}
          </p>
        )}
        <FieldError
          id="whatsappGroupName-error"
          message={errors.whatsappGroupName}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="lastMaterial">{t.lastMaterialLabel}</Label>
        <Textarea
          id="lastMaterial"
          name="lastMaterial"
          required
          rows={3}
          maxLength={FIELD_LIMITS.lastMaterial.max}
          value={value.lastMaterial}
          aria-invalid={Boolean(errors.lastMaterial)}
          aria-describedby={
            errors.lastMaterial ? "lastMaterial-error" : "lastMaterial-hint"
          }
          onChange={(event) => onChange({ lastMaterial: event.target.value })}
        />
        {!errors.lastMaterial && (
          <p id="lastMaterial-hint" className="text-xs text-muted-foreground">
            {t.lastMaterialHint}
          </p>
        )}
        <FieldError id="lastMaterial-error" message={errors.lastMaterial} />
      </div>
    </fieldset>
  );
}
