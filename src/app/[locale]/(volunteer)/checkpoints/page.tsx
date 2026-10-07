import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import {
  LoadErrorPanel,
  loadErrorLabels,
  type LoadErrorLabels,
} from "@/components/app/load-error";
import { PageHeader } from "@/components/app/page-header";
import { Panel } from "@/components/app/panel";
import { CheckpointRow } from "@/components/checkpoints/checkpoint-row";
import { CheckpointSummary } from "@/components/checkpoints/checkpoint-summary";
import { getCheckpoints } from "@/lib/api/checkpoints.server";
import { settle, type LoadFailure } from "@/lib/api/load.server";
import type { CheckpointList } from "@/lib/api/schemas";
import { requireSession } from "@/lib/api/session.server";
import { groupedCheckpoints, knownCheckpoints } from "@/lib/checkpoints/checkpoints";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/checkpoints">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkpoints" });
  return { title: t("metaTitle") };
}

export default async function CheckpointsRoute({
  params,
}: PageProps<"/[locale]/checkpoints">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [, loaded, common] = await Promise.all([
    requireSession(),
    settle(() => getCheckpoints()),
    getTranslations({ locale, namespace: "common" }),
  ]);

  return loaded.status === "failed" ? (
    <CheckpointsUnavailable failure={loaded.failure} labels={loadErrorLabels(common)} />
  ) : (
    <Checkpoints list={loaded.data} />
  );
}

function CheckpointsUnavailable({
  failure,
  labels,
}: {
  failure: LoadFailure;
  labels: LoadErrorLabels;
}) {
  const t = useTranslations("checkpoints");

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <LoadErrorPanel failure={failure} labels={labels} />
    </>
  );
}

function Checkpoints({ list }: { list: CheckpointList }) {
  const t = useTranslations("checkpoints");
  const groups = groupedCheckpoints(knownCheckpoints(list.items));

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <CheckpointSummary list={list} className="mt-6 max-w-xl" />
      <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-2">
        {groups.map(({ group, items }) => (
          <Panel
            key={group}
            id={`checkpoints-${group}`}
            title={t(`groups.${group}`)}
            padding="none"
          >
            <ol>
              {items.map((checkpoint) => (
                <CheckpointRow
                  key={checkpoint.key}
                  checkpoint={checkpoint}
                  claimingEnabled={list.claimingEnabled}
                />
              ))}
            </ol>
          </Panel>
        ))}
      </div>
    </>
  );
}
