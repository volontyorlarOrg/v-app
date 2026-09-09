"use client";

import { useId } from "react";

import { ActionStatus } from "@/components/app/action-status";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useActionForm } from "@/hooks/use-action-form";
import { accountErrorKey } from "@/lib/account/connections";
import { connectPasswordAction } from "@/lib/account/actions";
import {
  EMAIL_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  logInSchema,
} from "@/lib/auth/credentials";

export type PasswordConnectLabels = {
  title: string;
  description: string;
  email: string;
  password: string;
  reveal: string;
  conceal: string;
  submit: string;
  pending: string;
  done: string;
  fieldInvalid: string;
  errors: Record<string, string>;
};

export function PasswordConnectForm({
  locale,
  labels,
}: {
  locale: string;
  labels: PasswordConnectLabels;
}) {
  const id = useId();
  const { form, result, pending, formProps } = useActionForm({
    schema: logInSchema,
    defaultValues: { email: "", password: "" },
    action: connectPasswordAction,
  });
  const { register, formState } = form;

  const messageFor = (name: "email" | "password") => {
    const client = formState.errors[name]?.message;
    if (typeof client === "string") return labels.fieldInvalid;
    if (result.status === "error" && result.fields[name]) return labels.fieldInvalid;
    return undefined;
  };

  const emailError = messageFor("email");
  const passwordError = messageFor("password");
  const failure =
    result.status === "error" &&
    !(result.code === "validationFailed" && Object.keys(result.fields).length > 0)
      ? (labels.errors[accountErrorKey(result.code)] ?? labels.errors.unknown)
      : null;

  return (
    <form {...formProps}>
      <input type="hidden" name="locale" value={locale} />
      <h3 className="font-sans text-sm font-semibold text-ink">{labels.title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-ink-muted">
        {labels.description}
      </p>

      <FieldGroup className="mt-4">
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
        <Field invalid={Boolean(passwordError)}>
          <FieldLabel htmlFor={`${id}-password`}>{labels.password}</FieldLabel>
          <PasswordInput
            {...register("password")}
            id={`${id}-password`}
            autoComplete="current-password"
            maxLength={PASSWORD_MAX_LENGTH}
            required
            reveal={labels.reveal}
            conceal={labels.conceal}
            aria-invalid={Boolean(passwordError) || undefined}
          />
          <FieldError>{passwordError}</FieldError>
        </Field>
      </FieldGroup>

      <div className="mt-5 flex flex-col gap-4">
        {failure ? <ActionStatus tone="error">{failure}</ActionStatus> : null}
        {result.status === "ok" ? (
          <ActionStatus tone="done">{labels.done}</ActionStatus>
        ) : null}
        <Button type="submit" size="sm" disabled={pending} className="sm:self-start">
          {pending ? labels.pending : labels.submit}
        </Button>
      </div>
    </form>
  );
}
