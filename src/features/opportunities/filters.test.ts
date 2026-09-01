import { describe, expect, it } from "vitest";
import {
  filtersHref,
  parseFilters,
  serializeFilters,
  withFilterChange,
} from "./filters";
import { DEFAULT_FILTERS } from "./schemas";

/**
 * URL filter round-tripping.
 *
 * These tests exist because opportunity links get pasted into Telegram
 * channels. A URL that does not survive the round trip means the sender and
 * the reader see different listings.
 */

describe("parseFilters", () => {
  it("returns defaults for an empty query", () => {
    expect(parseFilters(new URLSearchParams())).toEqual(DEFAULT_FILTERS);
  });

  it("parses the handoff's canonical example URL", () => {
    const filters = parseFilters(
      new URLSearchParams("region=tashkent-city&sort=deadline&page=2"),
    );

    expect(filters.region).toBe("tashkent-city");
    expect(filters.sort).toBe("deadline");
    expect(filters.page).toBe(2);
  });

  it("discards an unknown region rather than failing the page", () => {
    // A truncated or hand-edited link from a chat app is normal input.
    expect(parseFilters(new URLSearchParams("region=atlantis")).region).toBeNull();
  });

  it("discards an unknown sort and falls back to the default", () => {
    expect(parseFilters(new URLSearchParams("sort=vibes")).sort).toBe("deadline");
  });

  it("rejects a non-positive or non-numeric page", () => {
    expect(parseFilters(new URLSearchParams("page=0")).page).toBe(1);
    expect(parseFilters(new URLSearchParams("page=-3")).page).toBe(1);
    expect(parseFilters(new URLSearchParams("page=abc")).page).toBe(1);
  });

  it("caps an oversized search term instead of forwarding it", () => {
    const filters = parseFilters(
      new URLSearchParams(`q=${"x".repeat(500)}`),
    );
    expect(filters.q).toHaveLength(120);
  });

  it("accepts a Next.js searchParams object as well as URLSearchParams", () => {
    expect(parseFilters({ region: "samarkand", page: "3" })).toMatchObject({
      region: "samarkand",
      page: 3,
    });
  });

  it("takes the first value when a parameter is repeated", () => {
    expect(parseFilters({ region: ["bukhara", "navoiy"] }).region).toBe("bukhara");
  });

  it("reads openOnly only from the exact flag value", () => {
    expect(parseFilters(new URLSearchParams("open=1")).openOnly).toBe(true);
    expect(parseFilters(new URLSearchParams("open=true")).openOnly).toBe(false);
  });
});

describe("serializeFilters", () => {
  it("omits defaults so an unfiltered listing has one canonical URL", () => {
    // Two URLs for the same listing would split cache entries and SEO signals.
    expect(serializeFilters(DEFAULT_FILTERS)).toBe("");
  });

  it("trims whitespace out of the search term", () => {
    expect(serializeFilters({ ...DEFAULT_FILTERS, q: "  books  " })).toBe("q=books");
  });

  it("round-trips a fully populated filter set", () => {
    const filters = {
      q: "clean-up",
      region: "samarkand" as const,
      format: "onsite" as const,
      openOnly: true,
      sort: "newest" as const,
      page: 4,
    };

    expect(parseFilters(new URLSearchParams(serializeFilters(filters)))).toEqual(
      filters,
    );
  });
});

describe("filtersHref", () => {
  it("produces a bare path when nothing is filtered", () => {
    expect(filtersHref(DEFAULT_FILTERS)).toBe("/opportunities");
  });

  it("appends the query when something is", () => {
    expect(filtersHref({ ...DEFAULT_FILTERS, region: "navoiy" })).toBe(
      "/opportunities?region=navoiy",
    );
  });
});

describe("withFilterChange", () => {
  it("resets to page 1 when a filter changes", () => {
    // Narrowing a search while on page 4 would otherwise land on an empty
    // page and look like "no results".
    const next = withFilterChange(
      { ...DEFAULT_FILTERS, page: 4 },
      { region: "khorezm" },
    );

    expect(next.page).toBe(1);
    expect(next.region).toBe("khorezm");
  });

  it("keeps the requested page when paginating", () => {
    expect(withFilterChange(DEFAULT_FILTERS, { page: 3 }).page).toBe(3);
  });
});
