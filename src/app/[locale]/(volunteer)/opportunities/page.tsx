import { useLocale, useTranslations } from "next-intl";
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
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { OpportunityFilters } from "@/components/opportunities/opportunity-filters";
import { PastOpportunitiesArchive } from "@/components/opportunities/past-opportunities-archive";
import { buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { listApplications } from "@/lib/api/applications.server";
import { dataOf, settle, type Loaded } from "@/lib/api/load.server";
import { listOpportunities } from "@/lib/api/opportunities.server";
import { listSaved, savedIds } from "@/lib/api/saved.server";
import type { ApplicationList, OpportunityList, SavedList } from "@/lib/api/schemas";
import type { ApplicationStatus } from "@/lib/applications/status";
import {
  DEFAULT_FILTERS,
  activeFilterCount,
  filterOpportunities,
  parseOpportunityFilters,
  type OpportunityFilters as Filters,
} from "@/lib/opportunities/filters";
import {
  opportunityViewParser,
  serializeOpportunitySearch,
  toFilterState,
  type OpportunityView,
} from "@/lib/opportunities/search-params";
import {
  OPPORTUNITY_KINDS,
  REGIONS,
  type OpportunitySummary,
} from "@/lib/opportunities/types";
import { localePath, navHref } from "@/lib/routing/routes";

export const dynamic = "force-dynamic";

type Listing = { items: readonly OpportunitySummary[]; total: number };

type ApplicationByOpportunity = ReadonlyMap<
  string,
  { id: string; status: ApplicationStatus }
>;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/opportunities">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "opportunities" });
  return { title: t("metaTitle") };
}

export default async function OpportunitiesPage({
  params,
  searchParams,
}: PageProps<"/[locale]/opportunities">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const query = await searchParams;
  const filters = parseOpportunityFilters(query);
  const view = opportunityViewParser.parseServerSide(query.view);
  const now = new Date();

  const [saved, applications, catalogue, common] = await Promise.all([
    settle(() => listSaved()),
    settle(() => listApplications()),
    view === "all" ? settle(() => listOpportunities(filters)) : Promise.resolve(null),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const listing =
    catalogue === null
      ? savedListing(saved, filters, now)
      : catalogueListing(catalogue);
  const savedList = dataOf(saved);

  return (
    <Opportunities
      filters={filters}
      view={view}
      listing={listing}
      saved={savedList ? savedIds(savedList) : new Set()}
      applications={applicationsByOpportunity(dataOf(applications))}
      applicationCount={dataOf(applications)?.items.length ?? null}
      now={now}
      errorLabels={loadErrorLabels(common)}
    />
  );
}

function savedListing(
  saved: Loaded<SavedList>,
  filters: Filters,
  now: Date,
): Loaded<Listing> {
  if (saved.status === "failed") return saved;
  const items = filterOpportunities(saved.data.items, filters, now);
  return { status: "loaded", data: { items, total: items.length } };
}

function catalogueListing(catalogue: Loaded<OpportunityList>): Loaded<Listing> {
  if (catalogue.status === "failed") return catalogue;
  return {
    status: "loaded",
    data: { items: catalogue.data.items, total: catalogue.data.total },
  };
}

function applicationsByOpportunity(
  applications: ApplicationList | null,
): ApplicationByOpportunity {
  const byOpportunity = new Map<string, { id: string; status: ApplicationStatus }>();
  for (const application of applications?.items ?? []) {
    if (!byOpportunity.has(application.opportunity.id)) {
      byOpportunity.set(application.opportunity.id, {
        id: application.id,
        status: application.status,
      });
    }
  }
  return byOpportunity;
}

function Opportunities({
  filters,
  view,
  listing,
  saved,
  applications,
  applicationCount,
  now,
  errorLabels,
}: {
  filters: Filters;
  view: OpportunityView;
  listing: Loaded<Listing>;
  saved: ReadonlySet<string>;
  applications: ApplicationByOpportunity;
  applicationCount: number | null;
  now: Date;
  errorLabels: LoadErrorLabels;
}) {
  const t = useTranslations("opportunities");
  const locale = useLocale() as Locale;

  const activeCount = activeFilterCount(filters);
  const showArchive = view === "all" && activeCount === 0 && filters.kind === null;

  return (
    <>
      <PageHeader
        title={t("title")}
        actions={
          <Link
            href={navHref("applications")}
            className={buttonClass({ variant: "outline", size: "sm" })}
          >
            {t("tabs.applications")}
            {applicationCount !== null ? (
              <span className="tabular text-xs text-ink-muted">{applicationCount}</span>
            ) : null}
          </Link>
        }
      />

      <div className="enter-rise mt-6 [--enter-delay:90ms]">
        <OpportunityFilters
          action={localePath(locale, "opportunities")}
          labels={{
            legend: t("filters.legend"),
            search: t("filters.search"),
            searchPlaceholder: t("filters.searchPlaceholder"),
            kinds: t("kinds.label"),
            region: t("filters.region"),
            regionAny: t("filters.regionAny"),
            savedOnly: t("filters.savedOnly"),
            clear: t("filters.clear"),
          }}
          kinds={[
            { key: "all", kind: null, label: t("kinds.all") },
            ...OPPORTUNITY_KINDS.map((kind) => ({
              key: kind,
              kind,
              label: t(`kinds.${kind}`),
            })),
          ].map((item) => ({
            key: item.key,
            label: item.label,
            href: serializeOpportunitySearch(navHref("opportunities"), {
              ...toFilterState(filters),
              view,
              kind: item.kind,
            }),
            active: filters.kind === item.kind,
          }))}
          regions={REGIONS.map((region) => ({
            value: region,
            label: t(`regions.${region}`),
          }))}
          hiddenValues={[
            ...(filters.kind ? [{ name: "kind", value: filters.kind }] : []),
            ...(filters.format ? [{ name: "format", value: filters.format }] : []),
            ...(filters.openOnly ? [{ name: "open", value: "1" }] : []),
            ...(filters.sort !== DEFAULT_FILTERS.sort
              ? [{ name: "sort", value: filters.sort }]
              : []),
          ]}
          clearHref={serializeOpportunitySearch(navHref("opportunities"), {
            view,
            kind: filters.kind,
          })}
          activeCount={activeCount}
        />
      </div>

      {listing.status === "failed" ? (
        <LoadErrorPanel
          failure={listing.failure}
          labels={errorLabels}
          className="mx-0 mt-5 max-w-none"
        />
      ) : (
        <>
          <div className="enter-rise mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 [--enter-delay:160ms]">
            <p role="status" className="text-sm text-ink-muted">
              {t("count", { count: listing.data.total })}
              {listing.data.total > listing.data.items.length
                ? ` · ${t("showingOf", { shown: listing.data.items.length, total: listing.data.total })}`
                : null}
            </p>
            {showArchive ? (
              <a
                href="#past-opportunities-title"
                className="inline-flex min-h-11 items-center text-sm font-semibold text-primary-ink underline-offset-4 hover:underline"
              >
                {t("archive.jumpTo")}
              </a>
            ) : null}
          </div>

          {listing.data.items.length === 0 ? (
            <Panel className="mt-4" padding="none">
              <EmptyState
                title={t("empty.title")}
                body={t("empty.body")}
                action={
                  <Link
                    href={serializeOpportunitySearch(navHref("opportunities"), {
                      view,
                      kind: filters.kind,
                    })}
                    className={buttonClass({ variant: "outline", size: "sm" })}
                  >
                    {t("filters.clear")}
                  </Link>
                }
              />
            </Panel>
          ) : (
            <ul className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {listing.data.items.map((opportunity) => (
                <li key={opportunity.id} className="flex">
                  <OpportunityCard
                    opportunity={opportunity}
                    saved={saved.has(opportunity.id)}
                    application={applications.get(opportunity.id)}
                    now={now}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {showArchive ? <PastOpportunitiesArchive /> : null}
    </>
  );
}
