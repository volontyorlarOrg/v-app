import { describe, expect, it } from "vitest";

import {
  DEFAULT_FILTERS,
  activeFilterCount,
  filterOpportunities,
  filtersToQuery,
  parseOpportunityFilters,
} from "@/lib/opportunities/filters";
import { sampleOpportunities } from "@/lib/sample/opportunities";

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
  const list = sampleOpportunities(NOW);

  it("narrows by region", () => {
    const result = filterOpportunities(
      list,
      { ...DEFAULT_FILTERS, region: "samarkand" },
      "en",
      NOW,
    );
    expect(result.map((o) => o.slug)).toEqual(["riverbank-clean-up"]);
  });

  it("matches the query against the title and the organiser in the given language", () => {
    expect(
      filterOpportunities(list, { ...DEFAULT_FILTERS, q: "kitob" }, "uz", NOW).length,
    ).toBeGreaterThan(0);
    expect(
      filterOpportunities(list, { ...DEFAULT_FILTERS, q: "Zzzz" }, "en", NOW),
    ).toEqual([]);
    expect(
      filterOpportunities(list, { ...DEFAULT_FILTERS, q: "corridor" }, "en", NOW).every(
        (o) => o.organization.name.en === "Green Corridor Group",
      ),
    ).toBe(true);
  });

  it("keeps only applicable opportunities when open-only is set", () => {
    const result = filterOpportunities(
      list,
      { ...DEFAULT_FILTERS, openOnly: true },
      "en",
      NOW,
    );
    expect(result.every((o) => o.status === "open")).toBe(true);
    expect(result.length).toBeLessThan(list.length);
  });

  it("puts applicable opportunities first whatever the sort", () => {
    for (const sort of ["deadline", "start"] as const) {
      const result = filterOpportunities(list, { ...DEFAULT_FILTERS, sort }, "en", NOW);
      const firstClosed = result.findIndex((o) => o.status !== "open");
      const lastOpen = result.map((o) => o.status).lastIndexOf("open");
      expect(firstClosed === -1 || firstClosed > lastOpen).toBe(true);
    }
  });
});
