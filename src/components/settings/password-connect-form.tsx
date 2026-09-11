"use client";

import { useId } from "react";

import { ActionStatus } from "@/components/app/action-status";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useActionForm } from "@/hooks/use-action-form";
import { accountErrorKey } from "@/lib/account/connections";
import { managePasswordAction } from "@/lib/account/actions";
import {
  EMAIL_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  passwordManagementSchema,
} from "@/lib/auth/credentials";

export type PasswordFormLabels = {
  title: string;
  description: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  passwordHint: string;
  reveal: string;
  conceal: string;
  submit: string;
  pending: string;
  done: string;
  fieldInvalid: string;
  errors: Record<string, string>;
};

export function PasswordForm({
  locale,
  mode,
  email,
  labels,
  headed = true,
}: {
  locale: string;
  mode: "set" | "change";
  email: string | null;
  labels: PasswordFormLabels;
  headed?: boolean;
}) {
  const id = useId();
  const { form, result, pending, formProps } = useActionForm({
    schema: passwordManagementSchema,
    defaultValues: {
      mode,
      email: email ?? "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    action: managePasswordAction,
  });
  const { register, formState } = form;

  const messageFor = (
    name: "email" | "currentPassword" | "newPassword" | "confirmPassword",
  ) => {
    const client = formState.errors[name]?.message;
    if (client === "passwordMismatch") return labels.errors.passwordMismatch;
    if (typeof client === "string") return labels.fieldInvalid;
    if (result.status === "error" && result.fields[name]) return labels.fieldInvalid;
    return undefined;
  };

  const emailError = messageFor("email");
  const currentPasswordError = messageFor("currentPassword");
  const newPasswordError = messageFor("newPassword");
  const confirmPasswordError = messageFor("confirmPassword");
  const failure =
    result.status === "error" &&
    !(result.code === "validationFailed" && Object.keys(result.fields).length > 0)
      ? (labels.errors[accountErrorKey(result.code)] ?? labels.errors.unknown)
      : null;

  return (
    <form {...formProps}>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" {...register("mode")} />
      {headed ? (
        <>
          <h3 className="font-sans text-sm font-semibold text-ink">{labels.title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">
            {labels.description}
          </p>
        </>
      ) : null}

      <FieldGroup className={headed ? "mt-4" : undefined}>
        {email ? (
          <input type="hidden" {...register("email")} />
        ) : (
          <Field invalid={Boolean(emailError)}>
            <FieldLabel htmlFor={`${id}-email`}>{labels.email}</FieldLabel>
            <Input
              {...register("email")}
              id={`${id}-email`}
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              maxLength={EMAIL_MAX_LENGTH}
              required
              aria-invalid={Boolean(emailError) || undefined}
            />
            <FieldError>{emailError}</FieldError>
          </Field>
        )}
        {mode === "change" ? (
          <Field invalid={Boolean(currentPasswordError)}>
            <FieldLabel htmlFor={`${id}-current-password`}>
              {labels.currentPassword}
            </FieldLabel>
            <PasswordInput
              {...register("currentPassword")}
              id={`${id}-current-password`}
              autoComplete="current-password"
              maxLength={PASSWORD_MAX_LENGTH}
              required
              reveal={labels.reveal}
              conceal={labels.conceal}
              aria-invalid={Boolean(currentPasswordError) || undefined}
            />
            <FieldError>{currentPasswordError}</FieldError>
          </Field>
        ) : (
          <input type="hidden" {...register("currentPassword")} />
        )}
        <Field invalid={Boolean(newPasswordError)}>
          <FieldLabel htmlFor={`${id}-new-password`}>{labels.newPassword}</FieldLabel>
          <PasswordInput
            {...register("newPassword")}
            id={`${id}-new-password`}
            autoComplete="new-password"
            minLength={PASSWORD_MIN_LENGTH}
            maxLength={PASSWORD_MAX_LENGTH}
            required
            reveal={labels.reveal}
            conceal={labels.conceal}
            aria-describedby={newPasswordError ? undefined : `${id}-password-hint`}
            aria-invalid={Boolean(newPasswordError) || undefined}
          />
          {newPasswordError ? null : (
            <FieldDescription id={`${id}-password-hint`}>
              {labels.passwordHint}
            </FieldDescription>
          )}
          <FieldError>{newPasswordError}</FieldError>
        </Field>
        <Field invalid={Boolean(confirmPasswordError)}>
          <FieldLabel htmlFor={`${id}-confirm-password`}>
            {labels.confirmPassword}
          </FieldLabel>
          <PasswordInput
            {...register("confirmPassword")}
            id={`${id}-confirm-password`}
            autoComplete="new-password"
            maxLength={PASSWORD_MAX_LENGTH}
            required
            reveal={labels.reveal}
            conceal={labels.conceal}
            aria-invalid={Boolean(confirmPasswordError) || undefined}
          />
          <FieldError>{confirmPasswordError}</FieldError>
        </Field>
      </FieldGroup>

      <div className="mt-5 flex flex-col gap-4">
        {failure ? <ActionStatus tone="error">{failure}</ActionStatus> : null}
        {result.status === "ok" ? (
          <ActionStatus tone="done">{labels.done}</ActionStatus>
        ) : null}
        <Button type="submit" disabled={pending} className="sm:self-start">
          {pending ? labels.pending : labels.submit}
        </Button>
      </div>
    </form>
  );
}
