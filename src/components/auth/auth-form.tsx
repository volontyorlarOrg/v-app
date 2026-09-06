"use client";

import { useId } from "react";

import { ActionStatus } from "@/components/app/action-status";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/auth/password-input";
import { useActionForm } from "@/hooks/use-action-form";
import type { ActionResult } from "@/lib/api/action-result";
import { createAccountAction, logInAction } from "@/lib/auth/actions";
import {
  EMAIL_MAX_LENGTH,
  FULL_NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  logInSchema,
  signUpSchema,
} from "@/lib/auth/credentials";

export type AuthFormLabels = {
  fullName: string;
  email: string;
  password: string;
  passwordHint: string;
  reveal: string;
  conceal: string;
  submit: string;
  pending: string;
  errors: Record<string, string>;
  fieldErrors: Record<string, string>;
};

type FormContext = {
  locale: string;
  next?: string | null;
  labels: AuthFormLabels;
};

const emailProps = {
  type: "email" as const,
  inputMode: "email" as const,
  autoCapitalize: "none",
  autoCorrect: "off",
  spellCheck: false,
  maxLength: EMAIL_MAX_LENGTH,
  required: true,
};

function rootError(result: ActionResult, labels: AuthFormLabels): string | null {
  if (result.status !== "error") return null;
  if (result.code === "validationFailed" && Object.keys(result.fields).length > 0) {
    return null;
  }
  return labels.errors[result.code] ?? labels.errors.unknown ?? null;
}

function Hidden({ locale, next }: { locale: string; next?: string | null }) {
  return (
    <>
      <input type="hidden" name="locale" value={locale} />
      {next ? <input type="hidden" name="next" value={next} /> : null}
    </>
  );
}

function SubmitRow({
  pending,
  error,
  labels,
}: {
  pending: boolean;
  error: string | null;
  labels: AuthFormLabels;
}) {
  return (
    <div className="mt-7 flex flex-col gap-4">
      {error ? <ActionStatus tone="error">{error}</ActionStatus> : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? labels.pending : labels.submit}
      </Button>
    </div>
  );
}

export function LogInForm({ locale, next, labels }: FormContext) {
  const id = useId();
  const { form, result, pending, formProps } = useActionForm({
    schema: logInSchema,
    defaultValues: { email: "", password: "" },
    action: logInAction,
  });
  const { register, formState } = form;

  const messageFor = (name: "email" | "password") => {
    const client = formState.errors[name]?.message;
    if (typeof client === "string") {
      return labels.fieldErrors[client] ?? labels.fieldErrors.invalid;
    }
    if (result.status === "error" && result.fields[name]) {
      return name === "password"
        ? labels.fieldErrors.passwordRefused
        : labels.fieldErrors.invalid;
    }
    return undefined;
  };

  const emailError = messageFor("email");
  const passwordError = messageFor("password");

  return (
    <form {...formProps}>
      <Hidden locale={locale} next={next} />
      <FieldGroup>
        <Field invalid={Boolean(emailError)}>
          <FieldLabel htmlFor={`${id}-email`}>{labels.email}</FieldLabel>
          <Input
            {...emailProps}
            {...register("email")}
            id={`${id}-email`}
            autoComplete="email"
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
      <SubmitRow pending={pending} error={rootError(result, labels)} labels={labels} />
    </form>
  );
}

export function SignUpForm({ locale, next, labels }: FormContext) {
  const id = useId();
  const { form, result, pending, formProps } = useActionForm({
    schema: signUpSchema,
    defaultValues: { fullName: "", email: "", password: "" },
    action: createAccountAction,
  });
  const { register, formState } = form;

  const messageFor = (name: "fullName" | "email" | "password") => {
    const client = formState.errors[name]?.message;
    if (typeof client === "string") {
      return labels.fieldErrors[client] ?? labels.fieldErrors.invalid;
    }
    if (result.status === "error" && result.fields[name]) {
      return name === "password"
        ? labels.fieldErrors.passwordRefused
        : labels.fieldErrors.invalid;
    }
    return undefined;
  };

  const nameError = messageFor("fullName");
  const emailError = messageFor("email");
  const passwordError = messageFor("password");

  return (
    <form {...formProps}>
      <Hidden locale={locale} next={next} />
      <FieldGroup>
        <Field invalid={Boolean(nameError)}>
          <FieldLabel htmlFor={`${id}-name`}>{labels.fullName}</FieldLabel>
          <Input
            {...register("fullName")}
            id={`${id}-name`}
            autoComplete="name"
            maxLength={FULL_NAME_MAX_LENGTH}
            required
            aria-invalid={Boolean(nameError) || undefined}
          />
          <FieldError>{nameError}</FieldError>
        </Field>
        <Field invalid={Boolean(emailError)}>
          <FieldLabel htmlFor={`${id}-email`}>{labels.email}</FieldLabel>
          <Input
            {...emailProps}
            {...register("email")}
            id={`${id}-email`}
            autoComplete="email"
            aria-invalid={Boolean(emailError) || undefined}
          />
          <FieldError>{emailError}</FieldError>
        </Field>
        <Field invalid={Boolean(passwordError)}>
          <FieldLabel htmlFor={`${id}-password`}>{labels.password}</FieldLabel>
          <PasswordInput
            {...register("password")}
            id={`${id}-password`}
            autoComplete="new-password"
            minLength={PASSWORD_MIN_LENGTH}
            maxLength={PASSWORD_MAX_LENGTH}
            required
            reveal={labels.reveal}
            conceal={labels.conceal}
            aria-describedby={passwordError ? undefined : `${id}-password-hint`}
            aria-invalid={Boolean(passwordError) || undefined}
          />
          {passwordError ? null : (
            <FieldDescription id={`${id}-password-hint`}>
              {labels.passwordHint}
            </FieldDescription>
          )}
          <FieldError>{passwordError}</FieldError>
        </Field>
      </FieldGroup>
      <SubmitRow pending={pending} error={rootError(result, labels)} labels={labels} />
    </form>
  );
}
