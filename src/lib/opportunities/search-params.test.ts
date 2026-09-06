import { describe, expect, it } from "vitest";

import { DEFAULT_FILTERS, parseOpportunityFilters } from "@/lib/opportunities/filters";
import {
  opportunityFilterParsers,
  opportunityViewParser,
  serializeOpportunitySearch,
  toFilterState,
} from "@/lib/opportunities/search-params";

describe("opportunity search params", () => {
  it("reads every key through parseOpportunityFilters", () => {
    expect(opportunityFilterParsers.q.parse("  books ")).toBe("books");
    expect(opportunityFilterParsers.region.parse("samarkand")).toBe("samarkand");
    expect(opportunityFilterParsers.region.parse("atlantis")).toBeNull();
    expect(opportunityFilterParsers.format.parse("remote")).toBe("remote");
    expect(opportunityFilterParsers.open.parse("1")).toBe(true);
    expect(opportunityFilterParsers.open.parse("yes")).toBe(false);
    expect(opportunityFilterParsers.sort.parse("start")).toBe("start");
    expect(opportunityFilterParsers.sort.parse("random")).toBe(DEFAULT_FILTERS.sort);
  });

  it("serializes a filter set to the same URL the GET form produces", () => {
    const filters = parseOpportunityFilters({
      q: "books",
      region: "samarkand",
      open: "1",
      sort: "start",
    });
    expect(serializeOpportunitySearch("/opportunities", toFilterState(filters))).toBe(
      "/opportunities?q=books&region=samarkand&open=1&sort=start",
    );
  });

  it("drops defaults so a clean filter set is a clean URL", () => {
    expect(
      serializeOpportunitySearch("/opportunities", toFilterState(DEFAULT_FILTERS)),
    ).toBe("/opportunities");
    expect(serializeOpportunitySearch("/opportunities", { view: "saved" })).toBe(
      "/opportunities?view=saved",
    );
    expect(serializeOpportunitySearch("/opportunities", { view: "all" })).toBe(
      "/opportunities",
    );
  });

  it("falls back to the catalogue view for an unknown view", () => {
    expect(opportunityViewParser.parseServerSide("saved")).toBe("saved");
    expect(opportunityViewParser.parseServerSide("mine")).toBe("all");
    expect(opportunityViewParser.parseServerSide(undefined)).toBe("all");
  });
});
