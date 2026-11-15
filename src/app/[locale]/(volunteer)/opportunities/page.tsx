import { useTranslations } from "next-intl";
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
import { buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { listApplications } from "@/lib/api/applications.server";
import { dataOf, settle, type Loaded } from "@/lib/api/load.server";
import { listOpportunities } from "@/lib/api/opportunities.server";
import { listSaved, savedIds } from "@/lib/api/saved.server";
import type { ApplicationList, OpportunityList, SavedList } from "@/lib/api/schemas";
import type { ApplicationStatus } from "@/lib/applications/status";
import {
  DEFAULT_FILTERS,
  OPPORTUNITY_SORTS,
  activeFilterCount,
  filterOpportunities,
  parseOpportunityFilters,
  sortOpportunities,
  type OpportunityFilters as Filters,
} from "@/lib/opportunities/filters";
import {
  opportunityViewParser,
  serializeOpportunitySearch,
  toFilterState,
  type OpportunityView,
} from "@/lib/opportunities/search-params";
import { groupOpportunities } from "@/lib/opportunities/listing";
import {
  OPPORTUNITY_FORMATS,
  OPPORTUNITY_KINDS,
  REGIONS,
  type OpportunitySummary,
} from "@/lib/opportunities/types";
import { navHref } from "@/lib/routing/routes";
import { cn } from "@/lib/utils";

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
      : catalogueListing(catalogue, filters, now);
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

function catalogueListing(
  catalogue: Loaded<OpportunityList>,
  filters: Filters,
  now: Date,
): Loaded<Listing> {
  if (catalogue.status === "failed") return catalogue;
  return {
    status: "loaded",
    data: {
      items: sortOpportunities(catalogue.data.items, filters.sort, now),
      total: catalogue.data.total,
    },
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

  const base = navHref("opportunities");
  const state = { ...toFilterState(filters), view };
  const without = (change: Partial<typeof state>) =>
    serializeOpportunitySearch(base, { ...state, ...change });

  const chips = [
    ...(filters.region
      ? [
          {
            key: "region",
            label: t(`regions.${filters.region}`),
            href: without({ region: null }),
          },
        ]
      : []),
    ...(filters.format
      ? [
          {
            key: "format",
            label: t(`format.${filters.format}`),
            href: without({ format: null }),
          },
        ]
      : []),
    ...(filters.openOnly
      ? [{ key: "open", label: t("filters.openOnly"), href: without({ open: false }) }]
      : []),
  ].map((chip) => ({
    ...chip,
    removeLabel: t("filters.remove", { filter: chip.label }),
  }));

  const groups =
    listing.status === "loaded" ? groupOpportunities(listing.data.items, now) : null;

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
          action={base}
          labels={{
            legend: t("filters.legend"),
            search: t("filters.search"),
            searchPlaceholder: t("filters.searchPlaceholder"),
            kinds: t("kinds.label"),
            region: t("filters.region"),
            regionAny: t("filters.regionAny"),
            savedOnly: t("filters.savedOnly"),
            clear: t("filters.clear"),
            more: t("filters.more"),
            format: t("filters.format"),
            formatAny: t("filters.formatAny"),
            openOnly: t("filters.openOnly"),
            sort: t("filters.sort"),
            done: t("filters.done"),
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
            href: without({ kind: item.kind }),
            active: filters.kind === item.kind,
          }))}
          regions={REGIONS.map((region) => ({
            value: region,
            label: t(`regions.${region}`),
          }))}
          formats={OPPORTUNITY_FORMATS.map((format) => ({
            value: format,
            label: t(`format.${format}`),
          }))}
          sorts={OPPORTUNITY_SORTS.map((sort) => ({
            value: sort,
            label: t(`sorting.${sort}`),
          }))}
          hiddenValues={[
            ...(view === "saved" ? [{ name: "view", value: view }] : []),
            ...(filters.kind ? [{ name: "kind", value: filters.kind }] : []),
            ...(filters.region ? [{ name: "region", value: filters.region }] : []),
            ...(filters.format ? [{ name: "format", value: filters.format }] : []),
            ...(filters.openOnly ? [{ name: "open", value: "1" }] : []),
            ...(filters.sort !== DEFAULT_FILTERS.sort
              ? [{ name: "sort", value: filters.sort }]
              : []),
          ]}
          chips={chips}
          clearHref={serializeOpportunitySearch(base, { view, kind: filters.kind })}
          showClear={activeFilterCount(filters) > 0}
          panelCount={chips.length}
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
          <p role="status" className="sr-only">
            {t("count", { count: listing.data.total })}
          </p>
          {listing.data.total > listing.data.items.length ? (
            <p className="mt-4 text-xs text-ink-muted">
              {t("showingOf", {
                shown: listing.data.items.length,
                total: listing.data.total,
              })}
            </p>
          ) : null}

          {listing.data.items.length === 0 ? (
            <Panel className="mt-6" padding="none">
              <EmptyState
                title={t("empty.title")}
                body={t("empty.body")}
                action={
                  <Link
                    href={serializeOpportunitySearch(base, {
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
          ) : groups ? (
            <div className="enter-rise mt-6 grid gap-10 [--enter-delay:160ms]">
              {(["current", "past"] as const).map((group) =>
                groups[group].length > 0 ? (
                  <section key={group} aria-labelledby={`${group}-opportunities-title`}>
                    <SectionTitle
                      id={`${group}-opportunities-title`}
                      title={t(`sections.${group}.title`)}
                      count={groups[group].length}
                      muted={group === "past"}
                    />
                    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {groups[group].map((opportunity) => (
                        <li key={opportunity.id} className="flex min-w-0">
                          <OpportunityCard
                            opportunity={opportunity}
                            saved={saved.has(opportunity.id)}
                            application={applications.get(opportunity.id)}
                            now={now}
                          />
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null,
              )}
            </div>
          ) : null}
        </>
      )}
    </>
  );
}

function SectionTitle({
  id,
  title,
  count,
  muted = false,
}: {
  id: string;
  title: string;
  count: number;
  muted?: boolean;
}) {
  return (
    <h2
      id={id}
      className={cn(
        "mb-3 flex items-baseline gap-2 text-xs font-semibold tracking-[0.14em] uppercase",
        muted ? "text-ink-muted" : "text-ink",
      )}
    >
      {title}
      <span aria-hidden="true" className="tabular font-normal text-ink-muted">
        {count}
      </span>
    </h2>
  );
}
