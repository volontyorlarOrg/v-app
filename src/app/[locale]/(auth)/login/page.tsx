import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import { AuthIntro } from "@/components/auth/auth-intro";
import { AuthPanel } from "@/components/auth/auth-panel";
import { AuthStatus } from "@/components/auth/auth-status";
import { CredentialsSection } from "@/components/auth/credentials-section";
import {
  ProviderButtons,
  googleStartHref,
  telegramStartHref,
} from "@/components/auth/provider-buttons";
import { Link } from "@/i18n/navigation";
import { isGoogleConfigured } from "@/lib/auth/config";
import { isGoogleStatus, type GoogleStatus } from "@/lib/auth/google";
import {
  isSessionStatus,
  safeReturnPath,
  type SessionStatus,
} from "@/lib/auth/session";
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

  const { telegram, google, session, next } = await searchParams;
  const returnTo = safeReturnPath(typeof next === "string" ? next : null);

  return (
    <Login
      locale={locale}
      next={returnTo}
      telegramStatus={isTelegramStatus(telegram) ? telegram : null}
      googleStatus={isGoogleStatus(google) ? google : null}
      sessionStatus={isSessionStatus(session) ? session : null}
      telegramHref={telegramStartHref(locale, returnTo)}
      googleHref={isGoogleConfigured() ? googleStartHref(locale, returnTo) : null}
    />
  );
}

function Login({
  locale,
  next,
  telegramStatus,
  googleStatus,
  sessionStatus,
  telegramHref,
  googleHref,
}: {
  locale: string;
  next: string | null;
  telegramStatus: TelegramStatus | null;
  googleStatus: GoogleStatus | null;
  sessionStatus: SessionStatus | null;
  telegramHref: string;
  googleHref: string | null;
}) {
  const t = useTranslations("auth");
  const signupHref = next
    ? `${navHref("signup")}?next=${encodeURIComponent(next)}`
    : navHref("signup");

  return (
    <>
      <AuthIntro title={t("login.title")} />

      {telegramStatus ? (
        <AuthStatus>{t(`telegram.${telegramStatus}`)}</AuthStatus>
      ) : null}
      {googleStatus ? <AuthStatus>{t(`google.${googleStatus}`)}</AuthStatus> : null}
      {sessionStatus ? <AuthStatus>{t(`session.${sessionStatus}`)}</AuthStatus> : null}

      <AuthPanel>
        <ProviderButtons
          telegramHref={telegramHref}
          googleHref={googleHref}
          telegram={t("providers.telegram")}
          google={t("providers.google")}
          googleUnavailable={t("providers.googleUnavailable")}
        />

        <CredentialsSection mode="login" locale={locale} next={next} />
      </AuthPanel>

      <p className="enter-rise mt-4 text-center text-sm text-ink-muted [--enter-delay:820ms]">
        {t("login.noAccount")}{" "}
        <Link
          href={signupHref}
          className="font-semibold text-primary-ink underline-offset-4 hover:underline"
        >
          {t("login.createAccount")}
        </Link>
      </p>
    </>
  );
}
