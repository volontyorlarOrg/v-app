import {
  DEFAULT_FILTERS,
  OPPORTUNITY_FORMATS,
  OPPORTUNITY_SORTS,
  REGIONS,
  opportunityFiltersSchema,
  type OpportunityFilters,
} from "./schemas";

export const FILTER_PARAMS = {
  q: "q",
  region: "region",
  format: "format",
  openOnly: "open",
  sort: "sort",
  page: "page",
} as const;

type SearchParamsInput =
  URLSearchParams | Record<string, string | string[] | undefined>;

function readParam(params: SearchParamsInput, key: string): string | undefined {
  if (params instanceof URLSearchParams) return params.get(key) ?? undefined;
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function oneOf<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
): T | null {
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : null;
}

export function parseFilters(params: SearchParamsInput): OpportunityFilters {
  const pageValue = Number.parseInt(readParam(params, FILTER_PARAMS.page) ?? "", 10);

  const candidate = {
    q: (readParam(params, FILTER_PARAMS.q) ?? "").slice(0, 120),
    region: oneOf(readParam(params, FILTER_PARAMS.region), REGIONS),
    format: oneOf(readParam(params, FILTER_PARAMS.format), OPPORTUNITY_FORMATS),
    openOnly: readParam(params, FILTER_PARAMS.openOnly) === "1",
    sort: oneOf(readParam(params, FILTER_PARAMS.sort), OPPORTUNITY_SORTS) ?? "deadline",
    page: Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1,
  };

  const parsed = opportunityFiltersSchema.safeParse(candidate);
  return parsed.success ? parsed.data : { ...DEFAULT_FILTERS };
}

export function serializeFilters(filters: OpportunityFilters): string {
  const params = new URLSearchParams();

  if (filters.q.trim()) params.set(FILTER_PARAMS.q, filters.q.trim());
  if (filters.region) params.set(FILTER_PARAMS.region, filters.region);
  if (filters.format) params.set(FILTER_PARAMS.format, filters.format);
  if (filters.openOnly) params.set(FILTER_PARAMS.openOnly, "1");
  if (filters.sort !== DEFAULT_FILTERS.sort)
    params.set(FILTER_PARAMS.sort, filters.sort);
  if (filters.page > 1) params.set(FILTER_PARAMS.page, String(filters.page));

  return params.toString();
}

export function filtersHref(filters: OpportunityFilters): string {
  const query = serializeFilters(filters);
  return query ? `/opportunities?${query}` : "/opportunities";
}

export function withFilterChange(
  filters: OpportunityFilters,
  change: Partial<OpportunityFilters>,
): OpportunityFilters {
  const changesPagination = "page" in change;
  return {
    ...filters,
    ...change,
    page: changesPagination ? (change.page ?? 1) : 1,
  };
}
