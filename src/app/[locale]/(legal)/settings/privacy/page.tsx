import type { Metadata } from "next";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";

import { LoadErrorRows, loadErrorLabels } from "@/components/app/load-error";
import { AuthIntro } from "@/components/auth/auth-intro";
import { AuthPanel } from "@/components/auth/auth-panel";
import { SignOutForm } from "@/components/auth/sign-out-form";
import { DataRequestForm } from "@/components/legal/legal-form";
import { Link } from "@/i18n/navigation";
import { settle } from "@/lib/api/load.server";
import { authed, requireSession } from "@/lib/api/session.server";
import { LEGAL_REQUEST_KINDS } from "@/lib/legal/constants";
import { legalRequestsSchema } from "@/lib/legal/schemas";
import { navHref } from "@/lib/routing/routes";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/settings/privacy">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return { title: t("requests.title") };
}

export default async function DataRequestsPage({
  params,
}: PageProps<"/[locale]/settings/privacy">) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireSession();
  const [t, common, format, requests] = await Promise.all([
    getTranslations({ locale, namespace: "legal" }),
    getTranslations({ locale, namespace: "common" }),
    getFormatter({ locale }),
    settle(() => authed("/me/legal/requests", { schema: legalRequestsSchema })),
  ]);

  return (
    <>
      <AuthIntro title={t("requests.title")} />
      <AuthPanel>
        <p className="mb-4 text-base leading-relaxed text-ink-muted">
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
        {requests.status === "failed" ? (
          <div className="mt-5 border-t border-border pt-4">
            <LoadErrorRows
              failure={requests.failure}
              labels={loadErrorLabels(common)}
            />
          </div>
        ) : requests.data.items.length > 0 ? (
          <ul className="mt-5 flex flex-col gap-4 border-t border-border pt-4">
            {requests.data.items.map((item) => (
              <li key={item.id} className="text-sm">
                <p className="font-semibold text-ink">
                  {t(`requests.kinds.${item.kind}`)} ·{" "}
                  {t(`requests.status.${item.status}`)}
                </p>
                <p className="text-ink-muted">
                  {format.dateTime(new Date(item.createdAt), { dateStyle: "medium" })}
                </p>
                {item.resolution ? (
                  <p className="mt-1 whitespace-pre-line text-ink">{item.resolution}</p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </AuthPanel>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-5 text-sm">
        <Link
          href={navHref("settings")}
          className="text-primary-ink underline underline-offset-4"
        >
          {t("back")}
        </Link>
        <SignOutForm label={t("signOut")} />
      </div>
    </>
  );
}
