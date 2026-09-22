import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

import type { OnboardingLabels } from "@/components/onboarding/labels";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";

export function StepField({
  id,
  label,
  optional,
  help,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: string;
  help?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <Field invalid={Boolean(error)}>
      <FieldLabel id={`${id}-label`} htmlFor={id}>
        {label}
        {optional ? (
          <span className="ml-1.5 text-xs font-normal text-ink-muted">{optional}</span>
        ) : null}
      </FieldLabel>
      {children}
      {help ? <FieldDescription id={`${id}-help`}>{help}</FieldDescription> : null}
      <FieldError>{error}</FieldError>
    </Field>
  );
}

export function StepActions({
  pending,
  labels,
  onSkip,
  onBack,
}: {
  pending: boolean;
  labels: Pick<OnboardingLabels, "continue" | "saving" | "skipStep" | "back">;
  onSkip?: () => void;
  onBack?: () => void;
}) {
  return (
    <div className="mt-7 flex flex-wrap items-center gap-2 border-t border-border pt-5">
      <Button
        type="submit"
        size="sm"
        disabled={pending}
        className="w-full sm:w-auto sm:min-w-36"
      >
        {pending ? labels.saving : labels.continue}
      </Button>
      <div className="flex w-full items-center justify-between gap-2 sm:contents">
        {onSkip ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onSkip}
            disabled={pending}
          >
            {labels.skipStep}
          </Button>
        ) : null}
        {onBack ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBack}
            disabled={pending}
            className="ml-auto"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            {labels.back}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
