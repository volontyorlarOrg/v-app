import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SearchX } from "lucide-react";
import { locales, type Locale } from "@/i18n/routing";
import { siteOrigin } from "@/lib/api/env.server";
import { localeAlternates, robotsFor } from "@/lib/routes/policy";
import {
  isUsingSampleData,
  listOpportunities,
} from "@/features/opportunities/api.server";
import { filtersHref, parseFilters } from "@/features/opportunities/filters";
import { PAGE_SIZE } from "@/features/opportunities/schemas";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { OpportunityFiltersBar } from "@/components/opportunities/opportunity-filters";
import { SampleDataNotice } from "@/components/shared/sample-data-notice";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { isApiError } from "@/lib/api/errors";

export async function generateMetadata(
  props: PageProps<"/[locale]/opportunities">,
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "opportunities.list" });

  const origin = siteOrigin();

  return {
    title: t("title"),
    description: t("subtitle"),

    robots: robotsFor("/opportunities"),
    alternates: {
      canonical: `${origin}/${locale}/opportunities`,
      languages: localeAlternates(origin, "/opportunities", locales),
    },
    openGraph: {
      title: t("title"),
      description: t("subtitle"),
      type: "website",
    },
  };
}

export default async function OpportunitiesPage(
  props: PageProps<"/[locale]/opportunities">,
) {
  const { locale } = await props.params;
  setRequestLocale(locale as Locale);

  const searchParams = await props.searchParams;
  const filters = parseFilters(searchParams);

  const [t, common] = await Promise.all([
    getTranslations("opportunities"),
    getTranslations("common"),
  ]);

  let result;

  try {
    result = await listOpportunities(filters);
  } catch (error) {
    const notConfigured = isApiError(error) && error.code === "notConfigured";
    const errors = await getTranslations("errors");

    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={t("list.title")} description={t("list.subtitle")} />
        <ErrorState
          title={notConfigured ? errors("notConfigured.title") : t("list.errorTitle")}
          body={notConfigured ? errors("notConfigured.body") : t("list.errorBody")}
        />
      </div>
    );
  }

  const { items, total, page } = result;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("list.title")} description={t("list.subtitle")} />

      {isUsingSampleData() ? (
        <SampleDataNotice message={common("sampleDataNotice")} />
      ) : null}

      <OpportunityFiltersBar resultCount={total} />

      {items.length === 0 ? (
        <EmptyState
          icon={<SearchX />}
          title={t("list.emptyTitle")}
          body={t("list.emptyBody")}
          action={
            <Button asChild variant="secondary">
              <Link href="/opportunities">{common("action.clearFilters")}</Link>
            </Button>
          }
        />
      ) : (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((opportunity) => (
              <li key={opportunity.id} className="flex">
                <OpportunityCard opportunity={opportunity} />
              </li>
            ))}
          </ul>

          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
            hrefFor={(next) => filtersHref({ ...filters, page: next })}
          />
        </>
      )}
    </div>
  );
}
