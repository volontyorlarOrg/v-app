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
import { OpportunitySectionTabs } from "@/components/opportunities/section-tabs";
import { buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { listApplications } from "@/lib/api/applications.server";
import { dataOf, settle, type Loaded } from "@/lib/api/load.server";
import { listOpportunities } from "@/lib/api/opportunities.server";
import { listSaved, savedIds } from "@/lib/api/saved.server";
import type { OpportunityList, SavedList } from "@/lib/api/schemas";
import {
  applicationsByOpportunity,
  type CardApplication,
} from "@/lib/opportunities/card";
import {
  OPPORTUNITY_SORTS,
  activeFilterCount,
  filterOpportunities,
  parseOpportunityFilters,
  type OpportunityFilters as Filters,
} from "@/lib/opportunities/filters";
import {
  opportunityViewParser,
  serializeOpportunitySearch,
  type OpportunityView,
} from "@/lib/opportunities/search-params";
import {
  OPPORTUNITY_FORMATS,
  REGIONS,
  type OpportunitySummary,
} from "@/lib/opportunities/types";
import { localePath, navHref } from "@/lib/routing/routes";

export const dynamic = "force-dynamic";

type Listing = { items: readonly OpportunitySummary[]; total: number };

type ApplicationByOpportunity = ReadonlyMap<string, CardApplication>;

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
      savedCount={savedList?.total ?? null}
      saved={savedList ? savedIds(savedList) : new Set()}
      applications={applicationsByOpportunity(dataOf(applications)?.items ?? [])}
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

function Opportunities({
  filters,
  view,
  listing,
  savedCount,
  saved,
  applications,
  applicationCount,
  now,
  errorLabels,
}: {
  filters: Filters;
  view: OpportunityView;
  listing: Loaded<Listing>;
  savedCount: number | null;
  saved: ReadonlySet<string>;
  applications: ApplicationByOpportunity;
  applicationCount: number | null;
  now: Date;
  errorLabels: LoadErrorLabels;
}) {
  const t = useTranslations("opportunities");
  const locale = useLocale() as Locale;

  const activeCount = activeFilterCount(filters);

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />

      <OpportunitySectionTabs
        current={view}
        savedCount={savedCount}
        applicationCount={applicationCount}
        className="enter-rise mt-6 [--enter-delay:90ms]"
      />

      <div className="mt-5">
        <OpportunityFilters
          action={localePath(locale, "opportunities")}
          labels={{
            legend: t("filters.legend"),
            search: t("filters.search"),
            searchPlaceholder: t("filters.searchPlaceholder"),
            region: t("filters.region"),
            regionAny: t("filters.regionAny"),
            format: t("filters.format"),
            formatAny: t("filters.formatAny"),
            sort: t("filters.sort"),
            openOnly: t("filters.openOnly"),
            apply: t("filters.apply"),
            clear: t("filters.clear"),
          }}
          regions={REGIONS.map((region) => ({
            value: region,
            label: t(`regions.${region}`),
          }))}
          formats={OPPORTUNITY_FORMATS.map((value) => ({
            value,
            label: t(`format.${value}`),
          }))}
          sorts={OPPORTUNITY_SORTS.map((value) => ({
            value,
            label: t(`filters.sortBy.${value}`),
          }))}
          hiddenValue={view === "saved" ? { name: "view", value: "saved" } : undefined}
          clearHref={serializeOpportunitySearch(navHref("opportunities"), { view })}
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
          <p
            role="status"
            className="enter-rise mt-4 text-sm text-ink-muted [--enter-delay:160ms]"
          >
            {t("count", { count: listing.data.total })}
            {listing.data.total > listing.data.items.length
              ? ` · ${t("showingOf", { shown: listing.data.items.length, total: listing.data.total })}`
              : null}
          </p>

          {listing.data.items.length === 0 ? (
            <Panel className="mt-4" padding="none">
              <EmptyState
                title={t("empty.title")}
                body={t("empty.body")}
                action={
                  <Link
                    href={navHref("opportunities")}
                    className={buttonClass({ variant: "outline", size: "sm" })}
                  >
                    {t("filters.clear")}
                  </Link>
                }
              />
            </Panel>
          ) : (
            <ul className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
    </>
  );
}
