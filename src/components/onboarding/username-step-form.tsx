"use client";

import { useId, type FormEvent } from "react";
import { useWatch } from "react-hook-form";

import { ActionStatus } from "@/components/app/action-status";
import type { OnboardingLabels } from "@/components/onboarding/labels";
import { StepActions } from "@/components/onboarding/step-controls";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useActionForm } from "@/hooks/use-action-form";
import { updateUsernameAction } from "@/lib/account/actions";
import { accountErrorKey } from "@/lib/account/connections";
import {
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  normalizeUsername,
  usernameFormSchema,
  type UsernameIdentity,
} from "@/lib/account/username";

const FIELD_MESSAGE_KEYS: Record<string, string> = {
  required: "usernameRequired",
  usernameShort: "usernameShort",
  usernameLong: "usernameLong",
  usernameCharacters: "usernameCharacters",
};

export function UsernameStepForm({
  locale,
  identity,
  addressPrefix,
  labels,
  onContinue,
  onBack,
}: {
  locale: string;
  identity: UsernameIdentity;
  addressPrefix: string | null;
  labels: OnboardingLabels;
  onContinue: () => void;
  onBack: () => void;
}) {
  const id = useId();
  const chosen = identity.source === "generated" ? null : identity.username;
  const { form, result, pending, formProps } = useActionForm({
    schema: usernameFormSchema,
    defaultValues: { username: chosen ?? "" },
    action: updateUsernameAction,
    onSuccess: onContinue,
  });
  const { register, formState, control } = form;
  const draft = useWatch({ control, name: "username" }) ?? "";
  const text = labels.usernameStep;

  const client = formState.errors.username?.message;
  const server = result.status === "error" ? result.fields.username?.[0] : undefined;
  const message = typeof client === "string" ? client : server;
  const fieldError = message
    ? (text.errors[FIELD_MESSAGE_KEYS[message] ?? "validationFailed"] ??
      text.errors.unknown)
    : undefined;
  const failure =
    result.status === "error" && !fieldError
      ? (text.errors[accountErrorKey(result.code)] ?? text.errors.unknown)
      : null;

  const preview = normalizeUsername(draft);

  function submit(event: FormEvent<HTMLFormElement>) {
    if (chosen !== null && normalizeUsername(form.getValues("username")) === chosen) {
      event.preventDefault();
      onContinue();
      return;
    }
    formProps.onSubmit(event);
  }

  return (
    <form {...formProps} onSubmit={submit} className="mt-6">
      <input type="hidden" name="locale" value={locale} />

      <Field invalid={Boolean(fieldError)}>
        <FieldLabel htmlFor={`${id}-username`}>{text.field}</FieldLabel>
        <div className="relative sm:max-w-sm">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-muted"
          >
            @
          </span>
          <Input
            {...register("username")}
            id={`${id}-username`}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            minLength={USERNAME_MIN_LENGTH}
            maxLength={USERNAME_MAX_LENGTH}
            required
            aria-describedby={`${id}-hint`}
            aria-invalid={Boolean(fieldError) || undefined}
            className="pl-7"
          />
        </div>
        <FieldDescription id={`${id}-hint`}>
          {identity.source === "telegram" && preview === identity.username
            ? `${text.fromTelegram} `
            : null}
          {text.hint}
        </FieldDescription>
        <FieldError>{fieldError}</FieldError>
      </Field>

      {addressPrefix ? (
        <p className="mt-4 text-sm text-ink-muted">
          {text.address}{" "}
          <span className="tabular font-semibold break-all text-ink">
            {addressPrefix}
            {preview || text.addressPlaceholder}
          </span>
        </p>
      ) : null}

      {failure ? (
        <ActionStatus tone="error" className="mt-5">
          {failure}
        </ActionStatus>
      ) : null}

      <StepActions pending={pending} labels={labels} onBack={onBack} />
    </form>
  );
}
