import { useLocale, useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import { Panel } from "@/components/app/panel";
import { PageHeader } from "@/components/app/page-header";
import { Segmented, type SegmentedItem } from "@/components/app/segmented";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { OpportunityFilters } from "@/components/opportunities/opportunity-filters";
import { buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import {
  OPPORTUNITY_SORTS,
  activeFilterCount,
  filterOpportunities,
  parseOpportunityFilters,
  type OpportunityFilters as Filters,
} from "@/lib/opportunities/filters";
import { OPPORTUNITY_FORMATS, REGIONS } from "@/lib/opportunities/types";
import { localePath, navHref } from "@/lib/routing/routes";
import { sampleOpportunities } from "@/lib/sample/opportunities";
import { sampleVolunteer } from "@/lib/sample/volunteer";

export const dynamic = "force-dynamic";

type OpportunityView = "all" | "saved";

function opportunityView(value: string | string[] | undefined): OpportunityView {
  return value === "saved" ? "saved" : "all";
}

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
  return (
    <Opportunities
      filters={parseOpportunityFilters(query)}
      view={opportunityView(query.view)}
    />
  );
}

function Opportunities({ filters, view }: { filters: Filters; view: OpportunityView }) {
  const t = useTranslations("opportunities");
  const common = useTranslations("common");
  const locale = useLocale() as Locale;

  const now = new Date();
  const volunteer = sampleVolunteer(now);
  const catalogue = sampleOpportunities(now);
  const source =
    view === "saved"
      ? catalogue.filter((opportunity) =>
          volunteer.savedSlugs.includes(opportunity.slug),
        )
      : catalogue;
  const list = filterOpportunities(source, filters, locale, now);
  const activeCount = activeFilterCount(filters);
  const views: SegmentedItem[] = [
    {
      key: "all",
      href: navHref("opportunities"),
      label: t("views.all"),
      active: view === "all",
      count: catalogue.length,
    },
    {
      key: "saved",
      href: `${navHref("opportunities")}?view=saved`,
      label: t("views.saved"),
      active: view === "saved",
      count: volunteer.savedSlugs.length,
    },
  ];

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        chip={common("sample.chip")}
      />

      <Segmented
        label={t("views.label")}
        items={views}
        className="enter-rise mt-6 [--enter-delay:90ms]"
      />

      <div className="mt-4">
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
          values={filters}
          hiddenValue={view === "saved" ? { name: "view", value: "saved" } : undefined}
          clearHref={
            view === "saved"
              ? `${navHref("opportunities")}?view=saved`
              : navHref("opportunities")
          }
          activeCount={activeCount}
        />
      </div>

      <p
        role="status"
        className="enter-rise mt-4 text-sm text-ink-muted [--enter-delay:160ms]"
      >
        {t("count", { count: list.length })}
      </p>

      {list.length === 0 ? (
        <Panel className="mt-4">
          <p className="font-semibold text-ink">{t("empty.title")}</p>
          <p className="mt-1 text-sm text-ink-muted">{t("empty.body")}</p>
          <Link
            href={navHref("opportunities")}
            className={buttonClass({
              variant: "outline",
              size: "sm",
              className: "mt-4",
            })}
          >
            {t("filters.clear")}
          </Link>
        </Panel>
      ) : (
        <ul className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((opportunity) => (
            <li key={opportunity.id} className="flex">
              <OpportunityCard
                opportunity={opportunity}
                saved={volunteer.savedSlugs.includes(opportunity.slug)}
                now={now}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
