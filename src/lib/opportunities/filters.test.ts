import { describe, expect, it } from "vitest";

import {
  DEFAULT_FILTERS,
  activeFilterCount,
  filterOpportunities,
  filtersToQuery,
  parseOpportunityFilters,
} from "@/lib/opportunities/filters";
import type { OpportunitySummary } from "@/lib/opportunities/types";

const NOW = new Date("2026-06-15T12:00:00.000Z");

describe("parseOpportunityFilters", () => {
  it("falls back to defaults for missing or unknown values", () => {
    expect(parseOpportunityFilters({})).toEqual(DEFAULT_FILTERS);
    expect(
      parseOpportunityFilters({
        region: "atlantis",
        format: "hologram",
        sort: "random",
      }),
    ).toEqual(DEFAULT_FILTERS);
  });

  it("reads the whitelisted values and trims the query", () => {
    expect(
      parseOpportunityFilters({
        q: "  books ",
        region: "samarkand",
        format: "remote",
        open: "1",
        sort: "start",
      }),
    ).toEqual({
      q: "books",
      region: "samarkand",
      format: "remote",
      openOnly: true,
      sort: "start",
    });
  });

  it("takes the first value when a parameter repeats", () => {
    expect(parseOpportunityFilters({ region: ["fergana", "samarkand"] }).region).toBe(
      "fergana",
    );
  });

  it("caps an oversized query", () => {
    expect(parseOpportunityFilters({ q: "a".repeat(500) }).q).toHaveLength(120);
  });
});

describe("activeFilterCount and filtersToQuery", () => {
  it("counts only the narrowing filters, not the sort", () => {
    expect(activeFilterCount(DEFAULT_FILTERS)).toBe(0);
    expect(activeFilterCount({ ...DEFAULT_FILTERS, sort: "start" })).toBe(0);
    expect(activeFilterCount({ ...DEFAULT_FILTERS, q: "x", openOnly: true })).toBe(2);
  });

  it("serialises only what differs from the defaults", () => {
    expect(filtersToQuery(DEFAULT_FILTERS)).toEqual({});
    expect(
      filtersToQuery({
        ...DEFAULT_FILTERS,
        region: "fergana",
        openOnly: true,
        sort: "start",
      }),
    ).toEqual({
      region: "fergana",
      open: "1",
      sort: "start",
    });
  });
});

describe("filterOpportunities", () => {
  const base = {
    summary: "",
    format: "onsite" as const,
    status: "open" as const,
  };
  const green = { id: "green", name: "Green Corridor Group", slug: "green", verified: false };
  const reading = { id: "reading", name: "Chilonzor Reading Corners", slug: "reading", verified: true };
  const list: OpportunitySummary[] = [
    {
      ...base,
      id: "book-drive",
      slug: "winter-book-drive",
      title: "Winter book drive",
      organization: reading,
      region: "tashkent-city",
      startsAt: "2026-06-27T09:00:00.000Z",
      applicationDeadline: "2026-06-20T18:00:00.000Z",
    },
    {
      ...base,
      id: "riverbank",
      slug: "riverbank-clean-up",
      title: "Riverbank clean-up",
      organization: green,
      region: "samarkand",
      startsAt: "2026-06-25T04:00:00.000Z",
      applicationDeadline: "2026-06-17T18:00:00.000Z",
    },
    {
      ...base,
      id: "planting",
      slug: "district-park-planting",
      title: "District park planting",
      organization: green,
      region: "fergana",
      status: "full",
      startsAt: "2026-06-22T04:00:00.000Z",
      applicationDeadline: "2026-06-18T18:00:00.000Z",
    },
    {
      ...base,
      id: "read-aloud",
      slug: "read-aloud-day",
      title: "Read-aloud day",
      organization: reading,
      region: "tashkent-city",
      startsAt: "2026-06-16T04:00:00.000Z",
      applicationDeadline: "2026-06-10T18:00:00.000Z",
    },
  ];

  it("narrows by region", () => {
    const result = filterOpportunities(list, { ...DEFAULT_FILTERS, region: "samarkand" }, NOW);
    expect(result.map((o) => o.slug)).toEqual(["riverbank-clean-up"]);
  });

  it("matches the query against the title and the organiser", () => {
    expect(
      filterOpportunities(list, { ...DEFAULT_FILTERS, q: "book" }, NOW).map((o) => o.slug),
    ).toEqual(["winter-book-drive"]);
    expect(filterOpportunities(list, { ...DEFAULT_FILTERS, q: "Zzzz" }, NOW)).toEqual([]);
    expect(
      filterOpportunities(list, { ...DEFAULT_FILTERS, q: "corridor" }, NOW).every(
        (o) => o.organization.name === "Green Corridor Group",
      ),
    ).toBe(true);
  });

  it("keeps only applicable opportunities when open-only is set", () => {
    const result = filterOpportunities(list, { ...DEFAULT_FILTERS, openOnly: true }, NOW);
    expect(result.map((o) => o.slug)).toEqual(["riverbank-clean-up", "winter-book-drive"]);
  });

  it("puts applicable opportunities first whatever the sort", () => {
    for (const sort of ["deadline", "start"] as const) {
      const result = filterOpportunities(list, { ...DEFAULT_FILTERS, sort }, NOW);
      const applicable = result.map(
        (o) => o.status === "open" && new Date(o.applicationDeadline) > NOW,
      );
      expect(applicable.lastIndexOf(true)).toBeLessThan(applicable.indexOf(false));
    }
  });
});
