import { useFormatter, useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import { Panel } from "@/components/app/panel";
import { PageHeader } from "@/components/app/page-header";
import { StatTiles, type Stat } from "@/components/app/stat-tile";
import { RecordProgress } from "@/components/dashboard/record-progress";
import { HistoryTable } from "@/components/record/history-table";
import { getHistory, getRecord } from "@/lib/api/record.server";
import {
  isReliabilityMeaningful,
  reliabilityPercent,
  type ParticipationEntry,
  type VolunteerRecord,
} from "@/lib/record/levels";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/record">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "record" });
  return { title: t("metaTitle") };
}

export default async function RecordPage({ params }: PageProps<"/[locale]/record">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [volunteerRecord, history] = await Promise.all([getRecord(), getHistory()]);
  return <Record record={volunteerRecord} history={history.items} />;
}

function Record({
  record,
  history,
}: {
  record: VolunteerRecord;
  history: readonly ParticipationEntry[];
}) {
  const t = useTranslations("record");
  const format = useFormatter();
  const percent = reliabilityPercent(record.counts);
  const meaningful = isReliabilityMeaningful(record.counts);

  const stats: Stat[] = [
    {
      id: "events",
      label: t("figures.events"),
      value: format.number(record.counts.attended),
      achievement: true,
    },
    {
      id: "reliability",
      label: t("figures.reliability"),
      value: meaningful && percent !== null ? `${percent}%` : "—",
      note: meaningful ? t("figures.reliabilityHelp") : t("figures.reliabilityPending"),
      achievement: true,
    },
    {
      id: "hours",
      label: t("figures.hours"),
      value: record.hours === undefined ? "—" : format.number(record.hours),
      note: record.hoursVerified ? undefined : t("figures.hoursUnverified"),
      achievement: true,
    },
    {
      id: "awaiting",
      label: t("figures.awaiting"),
      value: format.number(record.counts.acceptedUnconfirmed),
      note: t("figures.awaitingHelp"),
    },
  ];

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <StatTiles stats={stats} className="mt-6" />

      <div className="mt-6 grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <Panel id="level" title={t("level.label")} className="xl:self-start">
          <RecordProgress record={record} />
        </Panel>
        <Panel
          id="history"
          title={t("history.title")}
          description={t("history.description")}
          padding="none"
        >
          <HistoryTable entries={history} />
        </Panel>
      </div>
    </>
  );
}
