import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AuthIntro } from "@/components/auth/auth-intro";
import { AuthPanel } from "@/components/auth/auth-panel";
import { SignOutForm } from "@/components/auth/sign-out-form";
import { ConsentAcceptText } from "@/components/legal/consent-accept-text";
import { ConsentForm } from "@/components/legal/legal-form";
import { LegalLinks } from "@/components/legal/legal-links";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { onboardingPath } from "@/lib/onboarding/state";
import { safeReturnPath } from "@/lib/auth/session";
import { getSession } from "@/lib/auth/session.server";
import { getLegalState } from "@/lib/legal/state.server";
import { navHref } from "@/lib/routing/routes";

export const dynamic = "force-dynamic";

const SUMMARY = ["collect", "access", "store", "choices", "rights"] as const;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/consent">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return { title: t("title") };
}

export default async function ConsentPage({
  params,
  searchParams,
}: PageProps<"/[locale]/consent">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { next } = await searchParams;
  const returnTo = safeReturnPath(typeof next === "string" ? next : null);

  const [t, session] = await Promise.all([
    getTranslations({ locale, namespace: "legal" }),
    getSession(),
  ]);
  const state = session ? await getLegalState() : null;
  if (state?.pendingOnboarding) redirect(onboardingPath(returnTo));
  if (!session)
    redirect(returnTo ? `/signup?next=${encodeURIComponent(returnTo)}` : "/signup");

  return (
    <>
      <AuthIntro title={state?.accepted ? t("manageTitle") : t("title")} />

      <AuthPanel>
        {state?.accepted ? (
          <p className="text-base leading-relaxed text-ink">{t("accepted")}</p>
        ) : (
          <>
            <p className="text-base leading-relaxed text-ink">{t("intro")}</p>
            <ul className="mt-4 flex list-disc flex-col gap-2 ps-5 text-base leading-relaxed text-ink-muted">
              {SUMMARY.map((key) => (
                <li key={key}>{t(`summary.${key}`)}</li>
              ))}
            </ul>
          </>
        )}
        <div className="mt-4">
          <LegalLinks locale={locale as Locale} />
        </div>
        {state?.accepted ? null : (
          <div className="mt-5 border-t border-border pt-5">
            <ConsentForm
              locale={locale}
              next={returnTo}
              labels={{
                accept: <ConsentAcceptText locale={locale as Locale} />,
                submit: t("form.submit"),
                pending: t("form.pending"),
                required: t("form.required"),
                error: t("form.error"),
              }}
            />
          </div>
        )}
      </AuthPanel>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-5 text-sm">
        {session ? (
          <>
            <Link
              href={navHref("dataRequests")}
              className="text-primary-ink underline underline-offset-4"
            >
              {t("requests.title")}
            </Link>
            {state?.accepted ? (
              <Link
                href={navHref("settings")}
                className="text-primary-ink underline underline-offset-4"
              >
                {t("back")}
              </Link>
            ) : null}
            <SignOutForm label={t("signOut")} />
          </>
        ) : null}
      </div>
    </>
  );
}
