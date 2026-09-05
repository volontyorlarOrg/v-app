import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import { Panel } from "@/components/app/panel";
import { PageHeader } from "@/components/app/page-header";
import { Segmented, type SegmentedItem } from "@/components/app/segmented";
import { ApplicationRows } from "@/components/dashboard/application-rows";
import { listApplications } from "@/lib/api/applications.server";
import {
  APPLICATION_GROUPS,
  inApplicationGroup,
  isApplicationGroup,
  type ApplicationGroup,
  type ApplicationSummary,
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

  const [{ group }, applications] = await Promise.all([searchParams, listApplications()]);
  const selected = isApplicationGroup(group) ? group : "all";
  return <Applications group={selected} applications={applications.items} />;
}

function Applications({
  group,
  applications,
}: {
  group: ApplicationGroup;
  applications: readonly ApplicationSummary[];
}) {
  const t = useTranslations("applications");

  const now = new Date();
  const sorted = [...applications].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
  const shown = sorted.filter((application) =>
    inApplicationGroup(application.status, group),
  );

  const items: SegmentedItem[] = APPLICATION_GROUPS.map((key) => ({
    key,
    href:
      key === "all"
        ? navHref("applications")
        : `${navHref("applications")}?group=${key}`,
    label: t(`groups.${key}`),
    active: key === group,
    count: sorted.filter((application) => inApplicationGroup(application.status, key))
      .length,
  }));

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <Segmented
        label={t("groups.label")}
        items={items}
        className="enter-rise mt-6 [--enter-delay:90ms]"
      />
      <Panel className="mt-4" padding="none">
        <ApplicationRows
          applications={shown}
          now={now}
          empty={{ title: t("empty.title"), body: t("empty.body") }}
        />
      </Panel>
    </>
  );
}
