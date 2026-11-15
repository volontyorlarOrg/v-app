import { useFormatter, useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import { EmptyState } from "@/components/app/empty-state";
import {
  LoadErrorPanel,
  loadErrorLabels,
  type LoadErrorLabels,
} from "@/components/app/load-error";
import { Panel } from "@/components/app/panel";
import { PageHeader } from "@/components/app/page-header";
import { Segmented, type SegmentedItem } from "@/components/app/segmented";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { OpportunitySectionTabs } from "@/components/opportunities/section-tabs";
import { listApplications } from "@/lib/api/applications.server";
import { dataOf, settle, type Loaded } from "@/lib/api/load.server";
import { listSaved, savedIds } from "@/lib/api/saved.server";
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
import { applicationHref, navHref } from "@/lib/routing/routes";

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

  const savedList = dataOf(saved);

  return (
    <Applications
      group={group}
      applications={applications}
      savedCount={savedList?.total ?? null}
      saved={savedList ? savedIds(savedList) : new Set()}
      errorLabels={loadErrorLabels(common)}
    />
  );
}

function Applications({
  group,
  applications,
  savedCount,
  saved,
  errorLabels,
}: {
  group: ApplicationGroup;
  applications: Loaded<ApplicationList>;
  savedCount: number | null;
  saved: ReadonlySet<string>;
  errorLabels: LoadErrorLabels;
}) {
  const t = useTranslations("applications");
  const opportunities = useTranslations("opportunities");
  const format = useFormatter();

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
  })).filter((item) => item.key === "all" || item.active || item.count > 0);
  const filterable =
    group !== "all" || items.filter((item) => item.key !== "all").length > 1;

  return (
    <>
      <PageHeader title={opportunities("title")} description={t("description")} />

      <OpportunitySectionTabs
        current="applications"
        savedCount={savedCount}
        applicationCount={applications.status === "loaded" ? sorted.length : null}
        className="enter-rise mt-6 [--enter-delay:90ms]"
      />

      {applications.status === "failed" ? (
        <LoadErrorPanel
          failure={applications.failure}
          labels={errorLabels}
          className="mx-0 mt-5 max-w-none"
        />
      ) : (
        <section
          aria-labelledby="applications-title"
          className="enter-rise mt-6 [--enter-delay:160ms]"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2
              id="applications-title"
              className="flex items-baseline gap-2 text-xs font-semibold tracking-[0.14em] text-ink uppercase"
            >
              {t("title")}
              <span aria-hidden="true" className="tabular font-normal text-ink-muted">
                {shown.length}
              </span>
            </h2>
            {filterable ? <Segmented label={t("groups.label")} items={items} /> : null}
          </div>

          {shown.length === 0 ? (
            <Panel padding="none">
              <EmptyState title={t("empty.title")} body={t("empty.body")} />
            </Panel>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {shown.map((application) => (
                <li key={application.id} className="flex min-w-0">
                  <OpportunityCard
                    opportunity={application.opportunity}
                    saved={saved.has(application.opportunity.id)}
                    application={application}
                    now={now}
                    titleHref={applicationHref(application.id)}
                    note={
                      application.submittedAt
                        ? t("appliedOn", {
                            date: format.dateTime(
                              new Date(application.submittedAt),
                              "day",
                            ),
                          })
                        : t("startedOn", {
                            date: format.dateTime(
                              new Date(application.createdAt),
                              "day",
                            ),
                          })
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  );
}
