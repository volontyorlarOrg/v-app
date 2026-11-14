import type { Metadata } from "next";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";

import { AuthIntro } from "@/components/auth/auth-intro";
import { AuthPanel } from "@/components/auth/auth-panel";
import { SignOutForm } from "@/components/auth/sign-out-form";
import { ConsentForm, DataRequestForm } from "@/components/legal/legal-form";
import { LegalLinks } from "@/components/legal/legal-links";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { authed } from "@/lib/api/session.server";
import { safeReturnPath } from "@/lib/auth/session";
import { getSession } from "@/lib/auth/session.server";
import { LEGAL_REQUEST_KINDS } from "@/lib/legal/constants";
import { legalRequestsSchema } from "@/lib/legal/schemas";
import { getLegalState } from "@/lib/legal/state.server";

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

  const [t, format, session] = await Promise.all([
    getTranslations({ locale, namespace: "legal" }),
    getFormatter({ locale }),
    getSession(),
  ]);
  const [state, requests] = session
    ? await Promise.all([
        getLegalState(),
        authed("/me/legal/requests", { schema: legalRequestsSchema }),
      ])
    : [null, null];

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
                accept: t("form.accept"),
                optional: t("form.optional"),
                leaderboard: t("form.leaderboard"),
                leaderboardHelp: t("form.leaderboardHelp"),
                publicProfile: t("form.publicProfile"),
                publicProfileHelp: t("form.publicProfileHelp"),
                submit: t("form.submit"),
                pending: t("form.pending"),
                required: t("form.required"),
                error: t("form.error"),
              }}
            />
          </div>
        )}
      </AuthPanel>

      {session && requests ? (
        <AuthPanel>
          <h2 className="font-sans text-base font-semibold text-ink">
            {t("requests.title")}
          </h2>
          <p className="mt-1 mb-4 text-base leading-relaxed text-ink-muted">
            {t("requests.help")}
          </p>
          <DataRequestForm
            labels={{
              kind: t("requests.kind"),
              kinds: Object.fromEntries(
                LEGAL_REQUEST_KINDS.map((kind) => [kind, t(`requests.kinds.${kind}`)]),
              ) as Record<(typeof LEGAL_REQUEST_KINDS)[number], string>,
              message: t("requests.message"),
              submit: t("requests.submit"),
              pending: t("requests.pending"),
              sent: t("requests.sent"),
              error: t("requests.error"),
            }}
          />
          {requests.items.length > 0 ? (
            <ul className="mt-5 flex flex-col gap-4 border-t border-border pt-4">
              {requests.items.map((item) => (
                <li key={item.id} className="text-sm">
                  <p className="font-semibold text-ink">
                    {t(`requests.kinds.${item.kind}`)} ·{" "}
                    {t(`requests.status.${item.status}`)}
                  </p>
                  <p className="text-ink-muted">
                    {format.dateTime(new Date(item.createdAt), { dateStyle: "medium" })}
                  </p>
                  {item.resolution ? (
                    <p className="mt-1 whitespace-pre-line text-ink">
                      {item.resolution}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </AuthPanel>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-center gap-5 text-sm">
        {session ? (
          <>
            {state?.accepted ? (
              <Link
                href="/settings"
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
