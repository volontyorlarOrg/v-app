import { useTranslations } from "next-intl";

import { AuthDivider } from "@/components/auth/auth-divider";
import {
  LogInForm,
  SignUpForm,
  type AuthFormLabels,
} from "@/components/auth/auth-form";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "@/lib/auth/credentials";

export function CredentialsSection({
  mode,
  locale,
  next,
}: {
  mode: "login" | "signup";
  locale: string;
  next?: string | null;
}) {
  const t = useTranslations("auth");

  const labels: AuthFormLabels = {
    fullName: t("form.fullName"),
    email: t("form.email"),
    password: t("form.password"),
    passwordHint: t("form.passwordHint", { min: PASSWORD_MIN_LENGTH }),
    reveal: t("form.reveal"),
    conceal: t("form.conceal"),
    submit: mode === "login" ? t("login.submit") : t("signup.submit"),
    pending: mode === "login" ? t("login.pending") : t("signup.pending"),
    errors: {
      invalidCredentials: t("errors.invalidCredentials"),
      unauthenticated: t("errors.invalidCredentials"),
      emailTaken: t("errors.emailTaken"),
      emailUnavailable: t("errors.emailTaken"),
      conflict: t("errors.emailTaken"),
      weakPassword: t("errors.weakPassword"),
      accountDisabled: t("errors.accountDisabled"),
      forbidden: t("errors.accountDisabled"),
      rateLimitExceeded: t("errors.rateLimited"),
      rateLimited: t("errors.rateLimited"),
      authUnavailable: t("errors.authUnavailable"),
      passwordAuthUnavailable: t("errors.authUnavailable"),
      authRateLimitUnavailable: t("errors.authUnavailable"),
      notConfigured: t("errors.authUnavailable"),
      validationFailed: t("errors.validationFailed"),
      validation: t("errors.validationFailed"),
      network: t("errors.network"),
      timeout: t("errors.network"),
      unknown: t("errors.unknown"),
    },
    fieldErrors: {
      required: t("fieldErrors.required"),
      email: t("fieldErrors.email"),
      emailLong: t("fieldErrors.emailLong"),
      nameLong: t("fieldErrors.nameLong"),
      passwordShort: t("fieldErrors.passwordShort", { min: PASSWORD_MIN_LENGTH }),
      passwordLong: t("fieldErrors.passwordLong", { max: PASSWORD_MAX_LENGTH }),
      passwordRefused: t("fieldErrors.passwordRefused"),
      invalid: t("fieldErrors.invalid"),
    },
  };

  return (
    <>
      <AuthDivider label={t("form.divider")} />
      {mode === "login" ? (
        <LogInForm locale={locale} next={next} labels={labels} />
      ) : (
        <SignUpForm locale={locale} next={next} labels={labels} />
      )}
    </>
  );
}
