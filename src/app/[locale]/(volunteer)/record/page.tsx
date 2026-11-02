import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import { EmptyState } from "@/components/app/empty-state";
import {
  LoadErrorPanel,
  loadErrorLabels,
  type LoadErrorLabels,
} from "@/components/app/load-error";
import { PageHeader } from "@/components/app/page-header";
import { Panel } from "@/components/app/panel";
import { ParticipationTable } from "@/components/record/participation-table";
import { buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { settle, type Loaded } from "@/lib/api/load.server";
import { getHistory } from "@/lib/api/record.server";
import type { History } from "@/lib/api/schemas";
import { requireSession } from "@/lib/api/session.server";
import { isPending, participationStatus } from "@/lib/record/participation";
import { navHref } from "@/lib/routing/routes";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/record">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "record" });
  return { title: t("metaTitle") };
}

export default async function RecordRoute({ params }: PageProps<"/[locale]/record">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [, history, common] = await Promise.all([
    requireSession(),
    settle(() => getHistory()),
    getTranslations({ locale, namespace: "common" }),
  ]);

  return <Activity history={history} errorLabels={loadErrorLabels(common)} />;
}

function Activity({
  history,
  errorLabels,
}: {
  history: Loaded<History>;
  errorLabels: LoadErrorLabels;
}) {
  const t = useTranslations("record");
  const start = useTranslations("dashboard.start");
  const now = new Date();

  if (history.status === "failed") {
    return (
      <>
        <PageHeader title={t("title")} description={t("description")} />
        <LoadErrorPanel failure={history.failure} labels={errorLabels} />
      </>
    );
  }

  const entries = history.data.items;
  const waiting = entries.some((entry) => isPending(participationStatus(entry, now)));

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <Panel padding="none" className="mt-6">
        {entries.length === 0 ? (
          <EmptyState
            body={t("participation.empty")}
            action={
              <Link
                href={navHref("opportunities")}
                className={buttonClass({ variant: "outline", size: "sm" })}
              >
                {start("cta")}
              </Link>
            }
          />
        ) : (
          <>
            <ParticipationTable entries={entries} now={now} label={t("title")} />
            {waiting ? (
              <p className="border-t border-border px-5 py-3.5 text-sm leading-relaxed text-ink-muted">
                {t("participation.awaitingNote")}
              </p>
            ) : null}
          </>
        )}
      </Panel>
    </>
  );
}
