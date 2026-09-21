"use client";

import { useId } from "react";

import { ActionStatus } from "@/components/app/action-status";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useActionForm } from "@/hooks/use-action-form";
import { updateUsernameAction } from "@/lib/account/actions";
import { accountErrorKey } from "@/lib/account/connections";
import {
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  usernameFormSchema,
  type UsernameIdentity,
} from "@/lib/account/username";

export type UsernameLabels = {
  legend: string;
  description: string;
  field: string;
  hint: string;
  current: string;
  generated: string;
  managed: string;
  save: string;
  saving: string;
  saved: string;
  errors: Record<string, string>;
};

const FIELD_MESSAGE_KEYS: Record<string, string> = {
  required: "usernameRequired",
  usernameShort: "usernameShort",
  usernameLong: "usernameLong",
  usernameCharacters: "usernameCharacters",
};

export function UsernameForm({
  locale,
  identity,
  labels,
}: {
  locale: string;
  identity: UsernameIdentity;
  labels: UsernameLabels;
}) {
  const id = useId();
  const { form, result, pending, formProps } = useActionForm({
    schema: usernameFormSchema,
    defaultValues: {
      username: identity.source === "generated" ? "" : identity.username,
    },
    action: updateUsernameAction,
  });
  const { register, formState } = form;

  const client = formState.errors.username?.message;
  const server = result.status === "error" ? result.fields.username?.[0] : undefined;
  const message = typeof client === "string" ? client : server;
  const messageKey = message ? FIELD_MESSAGE_KEYS[message] : undefined;
  const fieldError = message
    ? (labels.errors[messageKey ?? "validationFailed"] ?? labels.errors.unknown)
    : undefined;

  const failure =
    result.status === "error" && !fieldError
      ? (labels.errors[accountErrorKey(result.code)] ?? labels.errors.unknown)
      : null;

  return (
    <form {...formProps}>
      <input type="hidden" name="locale" value={locale} />

      <Field invalid={Boolean(fieldError)}>
        <FieldLabel htmlFor={`${id}-username`}>{labels.field}</FieldLabel>
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
          aria-describedby={fieldError ? undefined : `${id}-hint`}
          aria-invalid={Boolean(fieldError) || undefined}
          className="sm:max-w-sm"
        />
        {fieldError ? null : (
          <FieldDescription id={`${id}-hint`}>{labels.hint}</FieldDescription>
        )}
        <FieldError>{fieldError}</FieldError>
      </Field>

      <div className="mt-5 flex flex-col gap-4">
        {failure ? <ActionStatus tone="error">{failure}</ActionStatus> : null}
        {result.status === "ok" ? (
          <ActionStatus tone="done">{labels.saved}</ActionStatus>
        ) : null}
        <Button type="submit" disabled={pending} className="sm:self-start">
          {pending ? labels.saving : labels.save}
        </Button>
      </div>
    </form>
  );
}
