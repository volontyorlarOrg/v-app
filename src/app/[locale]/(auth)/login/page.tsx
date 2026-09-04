import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";
import { AuthIntro } from "@/components/auth/auth-intro";
import { AuthDivider, AuthPanel } from "@/components/auth/auth-panel";
import { AuthStatus } from "@/components/auth/auth-status";
import { PreviewNotice } from "@/components/auth/preview-notice";
import { ProviderButtons, telegramStartHref } from "@/components/auth/provider-buttons";
import { Link } from "@/i18n/navigation";
import { isAuthConfigured } from "@/lib/auth/config";
import { safeReturnPath } from "@/lib/auth/session";
import { isTelegramStatus, type TelegramStatus } from "@/lib/auth/telegram";
import { HOME_ROUTE, navHref } from "@/lib/routing/routes";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/login">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.login" });
  return { title: t("metaTitle") };
}

export default async function LoginPage({
  params,
  searchParams,
}: PageProps<"/[locale]/login">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { reset, telegram, next } = await searchParams;
  const telegramEnabled = isAuthConfigured();

  return (
    <Login
      resetSent={reset === "sent"}
      telegramStatus={isTelegramStatus(telegram) ? telegram : null}
      telegramHref={
        telegramEnabled
          ? telegramStartHref(
              locale,
              safeReturnPath(typeof next === "string" ? next : null),
            )
          : null
      }
    />
  );
}

function Login({
  resetSent,
  telegramStatus,
  telegramHref,
}: {
  resetSent: boolean;
  telegramStatus: TelegramStatus | null;
  telegramHref: string | null;
}) {
  const t = useTranslations("auth");

  return (
    <>
      <AuthIntro title={t("login.title")} lead={t("login.lead")} />
      <PreviewNotice
        chip={t("preview.chip")}
        body={telegramHref ? t("preview.bodyTelegram") : t("preview.body")}
      />

      {telegramStatus ? (
        <AuthStatus>{t(`telegram.${telegramStatus}`)}</AuthStatus>
      ) : null}
      {resetSent ? <AuthStatus tone="done">{t("login.resetSent")}</AuthStatus> : null}

      <AuthPanel>
        <ProviderButtons
          href={navHref(HOME_ROUTE)}
          telegramHref={telegramHref}
          google={t("providers.google")}
          telegram={t("providers.telegram")}
        />
        {telegramHref ? (
          <p className="mt-3 text-xs leading-relaxed text-ink-muted">
            {t("telegram.handoff")}
          </p>
        ) : null}
        <AuthDivider label={t("providers.or")} />
        <AuthForm
          destination={navHref(HOME_ROUTE)}
          submitLabel={t("login.submit")}
          passwordLabels={{
            show: t("fields.showPassword"),
            hide: t("fields.hidePassword"),
          }}
          fields={[
            { name: "email", label: t("fields.email") },
            {
              name: "password",
              label: t("fields.password"),
              trailing: { href: navHref("forgotPassword"), label: t("login.forgot") },
            },
          ]}
        />
      </AuthPanel>

      <p className="enter-rise mt-6 text-center text-sm text-ink-muted [--enter-delay:820ms]">
        {t("login.noAccount")}{" "}
        <Link
          href={navHref("signup")}
          className="font-semibold text-primary-ink underline-offset-4 hover:underline"
        >
          {t("login.createAccount")}
        </Link>
      </p>
    </>
  );
}
