import { createParser, createSerializer, parseAsStringLiteral } from "nuqs/server";

import {
  DEFAULT_FILTERS,
  parseOpportunityFilters,
  type OpportunityFilters,
} from "./filters";

export const OPPORTUNITY_VIEWS = ["all", "saved"] as const;
export type OpportunityView = (typeof OPPORTUNITY_VIEWS)[number];

function filterParser<K extends keyof OpportunityFilters>(
  key: K,
  param: string,
  serialize: (value: OpportunityFilters[K]) => string,
) {
  return createParser<OpportunityFilters[K]>({
    parse: (value) => parseOpportunityFilters({ [param]: value })[key],
    serialize,
  });
}

export const opportunityFilterParsers = {
  q: filterParser("q", "q", (value) => value).withDefault(DEFAULT_FILTERS.q),
  region: filterParser("region", "region", (value) => value ?? ""),
  format: filterParser("format", "format", (value) => value ?? ""),
  open: filterParser("openOnly", "open", (value) => (value ? "1" : "")).withDefault(
    DEFAULT_FILTERS.openOnly,
  ),
  sort: filterParser("sort", "sort", (value) => value).withDefault(
    DEFAULT_FILTERS.sort,
  ),
};

export const opportunityViewParser =
  parseAsStringLiteral(OPPORTUNITY_VIEWS).withDefault("all");

export const serializeOpportunitySearch = createSerializer({
  ...opportunityFilterParsers,
  view: opportunityViewParser,
});

export function toFilterState(filters: OpportunityFilters) {
  return {
    q: filters.q,
    region: filters.region,
    format: filters.format,
    open: filters.openOnly,
    sort: filters.sort,
  };
}
