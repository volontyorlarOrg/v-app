import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import {
  LoadErrorRows,
  loadErrorLabels,
  type LoadErrorLabels,
} from "@/components/app/load-error";
import { Panel } from "@/components/app/panel";
import { PageHeader } from "@/components/app/page-header";
import { Segmented, type SegmentedItem } from "@/components/app/segmented";
import { ApplicationRows } from "@/components/dashboard/application-rows";
import { OpportunitySectionTabs } from "@/components/opportunities/section-tabs";
import { listApplications } from "@/lib/api/applications.server";
import { dataOf, settle, type Loaded } from "@/lib/api/load.server";
import { listSaved } from "@/lib/api/saved.server";
import type { ApplicationList } from "@/lib/api/schemas";
import {
  loadApplicationsSearch,
  serializeApplicationsSearch,
} from "@/lib/applications/search-params";
import {
  APPLICATION_GROUPS,
  inApplicationGroup,
  type ApplicationGroup,
} from "@/lib/applications/status";
import { navHref } from "@/lib/routing/routes";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/applications">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "applications" });
  return { title: t("metaTitle") };
}

export default async function ApplicationsPage({
  params,
  searchParams,
}: PageProps<"/[locale]/applications">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [{ group }, applications, saved, common] = await Promise.all([
    loadApplicationsSearch(searchParams),
    settle(() => listApplications()),
    settle(() => listSaved()),
    getTranslations({ locale, namespace: "common" }),
  ]);

  return (
    <Applications
      group={group}
      applications={applications}
      savedCount={dataOf(saved)?.total ?? null}
      errorLabels={loadErrorLabels(common)}
    />
  );
}

function Applications({
  group,
  applications,
  savedCount,
  errorLabels,
}: {
  group: ApplicationGroup;
  applications: Loaded<ApplicationList>;
  savedCount: number | null;
  errorLabels: LoadErrorLabels;
}) {
  const t = useTranslations("applications");
  const opportunities = useTranslations("opportunities");

  const now = new Date();
  const sorted =
    applications.status === "loaded"
      ? [...applications.data.items].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )
      : [];
  const shown = sorted.filter((application) =>
    inApplicationGroup(application.status, group),
  );

  const items: SegmentedItem[] = APPLICATION_GROUPS.map((key) => ({
    key,
    href: serializeApplicationsSearch(navHref("applications"), { group: key }),
    label: t(`groups.${key}`),
    active: key === group,
    count: sorted.filter((application) => inApplicationGroup(application.status, key))
      .length,
  }));

  return (
    <>
      <PageHeader title={opportunities("title")} description={t("description")} />

      <OpportunitySectionTabs
        current="applications"
        savedCount={savedCount}
        applicationCount={applications.status === "loaded" ? sorted.length : null}
        className="enter-rise mt-6 [--enter-delay:90ms]"
      />

      <Panel id="applications" title={t("title")} padding="none" className="mt-5">
        {applications.status === "failed" ? (
          <LoadErrorRows failure={applications.failure} labels={errorLabels} />
        ) : (
          <>
            <div className="border-b border-border px-5 py-4">
              <Segmented label={t("groups.label")} items={items} />
            </div>
            <ApplicationRows
              applications={shown}
              now={now}
              empty={{ title: t("empty.title"), body: t("empty.body") }}
            />
          </>
        )}
      </Panel>
    </>
  );
}
