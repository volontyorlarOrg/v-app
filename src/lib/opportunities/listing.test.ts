import { describe, expect, it } from "vitest";

import { groupOpportunities } from "./listing";
import type { OpportunitySummary } from "./types";

const now = new Date("2026-10-09T12:00:00Z");
const base: OpportunitySummary = {
  id: "vacancy",
  slug: "vacancy",
  title: "Vacancy",
  kind: "volunteering",
  organization: { id: "org", name: "Team", slug: "team", verified: true },
  region: "tashkent-city",
  format: "onsite",
  status: "open",
  startsAt: "2026-10-20T12:00:00Z",
  applicationDeadline: "2026-10-10T12:00:00Z",
  acceptanceMode: "manual",
  essayRequired: false,
};

describe("groupOpportunities", () => {
  it("separates closed and deadline-passed vacancies while preserving posting order", () => {
    const items = [
      { ...base, id: "new-current" },
      { ...base, id: "closed", status: "closed" as const },
      { ...base, id: "full-current", status: "full" as const },
      { ...base, id: "deadline-now", applicationDeadline: now.toISOString() },
      {
        ...base,
        id: "full-expired",
        status: "full" as const,
        applicationDeadline: "2026-10-08T12:00:00Z",
      },
    ];
    const groups = groupOpportunities(items, now);
    expect(groups.current.map((item) => item.id)).toEqual([
      "new-current",
      "full-current",
    ]);
    expect(groups.expired.map((item) => item.id)).toEqual([
      "closed",
      "deadline-now",
      "full-expired",
    ]);
    expect(items.map((item) => item.id)).toEqual([
      "new-current",
      "closed",
      "full-current",
      "deadline-now",
      "full-expired",
    ]);
  });
});
