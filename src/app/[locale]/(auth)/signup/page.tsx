import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import { AuthIntro } from "@/components/auth/auth-intro";
import { AuthPanel } from "@/components/auth/auth-panel";
import { CredentialsSection } from "@/components/auth/credentials-section";
import {
  ProviderButtons,
  googleStartHref,
  telegramStartHref,
} from "@/components/auth/provider-buttons";
import { Link } from "@/i18n/navigation";
import { isGoogleConfigured } from "@/lib/auth/config";
import { safeReturnPath } from "@/lib/auth/session";
import { navHref } from "@/lib/routing/routes";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/signup">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.signup" });
  return { title: t("metaTitle") };
}

export default async function SignupPage({
  params,
  searchParams,
}: PageProps<"/[locale]/signup">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { next } = await searchParams;
  const returnTo = safeReturnPath(typeof next === "string" ? next : null);

  return (
    <Signup
      next={returnTo}
      telegramHref={telegramStartHref(locale, returnTo)}
      googleHref={isGoogleConfigured() ? googleStartHref(locale, returnTo) : null}
    />
  );
}

const legalLinkClass =
  "font-semibold text-primary-ink hover:underline underline-offset-4";

function Signup({
  next,
  telegramHref,
  googleHref,
}: {
  next: string | null;
  telegramHref: string;
  googleHref: string | null;
}) {
  const t = useTranslations("auth");
  const loginHref = next
    ? `${navHref("login")}?next=${encodeURIComponent(next)}`
    : navHref("login");

  return (
    <>
      <AuthIntro title={t("signup.title")} />

      <AuthPanel>
        <ProviderButtons
          telegramHref={telegramHref}
          googleHref={googleHref}
          telegram={t("providers.telegram")}
          google={t("providers.google")}
          googleUnavailable={t("providers.googleUnavailable")}
        />

        <CredentialsSection mode="signup" next={next} />
      </AuthPanel>

      <p className="enter-rise mt-4 text-center text-sm text-ink-muted [--enter-delay:820ms]">
        {t("signup.haveAccount")}{" "}
        <Link href={loginHref} className={legalLinkClass}>
          {t("signup.logIn")}
        </Link>
      </p>
    </>
  );
}
