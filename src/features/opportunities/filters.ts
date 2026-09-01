import {
  DEFAULT_FILTERS,
  OPPORTUNITY_FORMATS,
  OPPORTUNITY_SORTS,
  REGIONS,
  opportunityFiltersSchema,
  type OpportunityFilters,
} from "./schemas";

/**
 * URL <-> filter translation.
 *
 * Filters live in the URL so that `/uz/opportunities?region=tashkent-city&sort=deadline`
 * is a real, shareable, bookmarkable address — the handoff's example. Keeping
 * them in component state would make every filtered view unlinkable, which
 * matters more than usual here because the product's distribution *is* people
 * pasting links into Telegram.
 *
 * `nuqs` owns reading and writing them in components; this module owns the
 * parsing rules, so a server component and a client component agree on what a
 * given query string means.
 */

/** Query-parameter names. Short, because these end up in shared links. */
export const FILTER_PARAMS = {
  q: "q",
  region: "region",
  format: "format",
  openOnly: "open",
  sort: "sort",
  page: "page",
} as const;

type SearchParamsInput =
  | URLSearchParams
  | Record<string, string | string[] | undefined>;

function readParam(params: SearchParamsInput, key: string): string | undefined {
  if (params instanceof URLSearchParams) return params.get(key) ?? undefined;
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function oneOf<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
): T | null {
  return value && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : null;
}

/**
 * Parses a query string into filters, discarding anything invalid.
 *
 * Never throws. A hand-edited or truncated URL from a chat app is normal
 * input, not an error condition — the page should render the closest sane
 * listing rather than an error boundary.
 */
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

/**
 * Serialises filters back to a query string, omitting defaults.
 *
 * Omitting defaults keeps shared URLs short and stops two identical listings
 * from having two different addresses (which would split their cache entries
 * and their search-engine signals).
 */
export function serializeFilters(filters: OpportunityFilters): string {
  const params = new URLSearchParams();

  if (filters.q.trim()) params.set(FILTER_PARAMS.q, filters.q.trim());
  if (filters.region) params.set(FILTER_PARAMS.region, filters.region);
  if (filters.format) params.set(FILTER_PARAMS.format, filters.format);
  if (filters.openOnly) params.set(FILTER_PARAMS.openOnly, "1");
  if (filters.sort !== DEFAULT_FILTERS.sort) params.set(FILTER_PARAMS.sort, filters.sort);
  if (filters.page > 1) params.set(FILTER_PARAMS.page, String(filters.page));

  return params.toString();
}

/** `/uz/opportunities?…` for a given filter set. */
export function filtersHref(filters: OpportunityFilters): string {
  const query = serializeFilters(filters);
  return query ? `/opportunities?${query}` : "/opportunities";
}

/**
 * Changing a filter resets pagination.
 *
 * Without this, narrowing a search while on page 4 lands on an empty page and
 * looks like "no results" when there are plenty on page 1.
 */
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
