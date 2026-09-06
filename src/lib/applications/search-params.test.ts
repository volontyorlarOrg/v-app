import { describe, expect, it } from "vitest";

import {
  loadApplicationsSearch,
  serializeApplicationsSearch,
} from "@/lib/applications/search-params";

describe("application search params", () => {
  it("reads a known group and falls back to all", () => {
    expect(loadApplicationsSearch({ group: "drafts" })).toEqual({ group: "drafts" });
    expect(loadApplicationsSearch({ group: "everything" })).toEqual({ group: "all" });
    expect(loadApplicationsSearch({})).toEqual({ group: "all" });
  });

  it("links to a group without a parameter for the default", () => {
    expect(serializeApplicationsSearch("/applications", { group: "decided" })).toBe(
      "/applications?group=decided",
    );
    expect(serializeApplicationsSearch("/applications", { group: "all" })).toBe(
      "/applications",
    );
  });
});
