import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import { AuthIntro } from "@/components/auth/auth-intro";
import { AuthPanel } from "@/components/auth/auth-panel";
import { AuthStatus } from "@/components/auth/auth-status";
import { ProviderButtons, telegramStartHref } from "@/components/auth/provider-buttons";
import { Link } from "@/i18n/navigation";
import { isSessionStatus, safeReturnPath, type SessionStatus } from "@/lib/auth/session";
import { isTelegramStatus, type TelegramStatus } from "@/lib/auth/telegram";
import { navHref } from "@/lib/routing/routes";

export const dynamic = "force-dynamic";

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

  const { telegram, session, next } = await searchParams;

  return (
    <Login
      telegramStatus={isTelegramStatus(telegram) ? telegram : null}
      sessionStatus={isSessionStatus(session) ? session : null}
      telegramHref={telegramStartHref(
        locale,
        safeReturnPath(typeof next === "string" ? next : null),
      )}
    />
  );
}

function Login({
  telegramStatus,
  sessionStatus,
  telegramHref,
}: {
  telegramStatus: TelegramStatus | null;
  sessionStatus: SessionStatus | null;
  telegramHref: string;
}) {
  const t = useTranslations("auth");

  return (
    <>
      <AuthIntro title={t("login.title")} lead={t("login.lead")} />

      {telegramStatus ? (
        <AuthStatus>{t(`telegram.${telegramStatus}`)}</AuthStatus>
      ) : null}
      {sessionStatus ? <AuthStatus>{t(`session.${sessionStatus}`)}</AuthStatus> : null}

      <AuthPanel>
        <ProviderButtons
          telegramHref={telegramHref}
          telegram={t("providers.telegram")}
          google={t("providers.google")}
          googleUnavailable={t("providers.googleUnavailable")}
        />
        <p className="mt-4 text-xs leading-relaxed text-ink-muted">
          {t("telegram.handoff")}
        </p>
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
