import type { Locale } from "@/i18n/routing";

import { canApply } from "./deadline";
import {
  OPPORTUNITY_FORMATS,
  REGIONS,
  localized,
  type OpportunityFormat,
  type OpportunitySummary,
  type Region,
} from "./types";

export const OPPORTUNITY_SORTS = ["deadline", "start"] as const;
export type OpportunitySort = (typeof OPPORTUNITY_SORTS)[number];

export type OpportunityFilters = {
  q: string;
  region: Region | null;
  format: OpportunityFormat | null;
  openOnly: boolean;
  sort: OpportunitySort;
};

export const DEFAULT_FILTERS: OpportunityFilters = {
  q: "",
  region: null,
  format: null,
  openOnly: false,
  sort: "deadline",
};

export type SearchParams = Record<string, string | string[] | undefined>;

const MAX_QUERY_LENGTH = 120;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function oneOf<T extends string>(
  values: readonly T[],
  value: string | undefined,
): T | null {
  return values.includes(value as T) ? (value as T) : null;
}

export function parseOpportunityFilters(params: SearchParams): OpportunityFilters {
  return {
    q: (first(params.q) ?? "").trim().slice(0, MAX_QUERY_LENGTH),
    region: oneOf(REGIONS, first(params.region)),
    format: oneOf(OPPORTUNITY_FORMATS, first(params.format)),
    openOnly: first(params.open) === "1",
    sort: oneOf(OPPORTUNITY_SORTS, first(params.sort)) ?? DEFAULT_FILTERS.sort,
  };
}

export function activeFilterCount(filters: OpportunityFilters): number {
  let count = 0;
  if (filters.q) count += 1;
  if (filters.region) count += 1;
  if (filters.format) count += 1;
  if (filters.openOnly) count += 1;
  return count;
}

export function filtersToQuery(filters: OpportunityFilters): Record<string, string> {
  const query: Record<string, string> = {};
  if (filters.q) query.q = filters.q;
  if (filters.region) query.region = filters.region;
  if (filters.format) query.format = filters.format;
  if (filters.openOnly) query.open = "1";
  if (filters.sort !== DEFAULT_FILTERS.sort) query.sort = filters.sort;
  return query;
}

export function filterOpportunities<T extends OpportunitySummary>(
  list: readonly T[],
  filters: OpportunityFilters,
  locale: Locale,
  now: Date,
): T[] {
  const needle = filters.q.toLocaleLowerCase();

  const matches = list.filter((opportunity) => {
    const haystack = `${localized(opportunity.title, locale)} ${localized(
      opportunity.organization.name,
      locale,
    )}`.toLocaleLowerCase();

    return (
      (!needle || haystack.includes(needle)) &&
      (!filters.region || opportunity.region === filters.region) &&
      (!filters.format || opportunity.format === filters.format) &&
      (!filters.openOnly || canApply(opportunity, now))
    );
  });

  const time = (opportunity: T) =>
    new Date(
      filters.sort === "deadline"
        ? opportunity.applicationDeadline
        : opportunity.startsAt,
    ).getTime();

  return matches.sort((a, b) => {
    const openA = canApply(a, now) ? 0 : 1;
    const openB = canApply(b, now) ? 0 : 1;
    return openA - openB || time(a) - time(b);
  });
}
