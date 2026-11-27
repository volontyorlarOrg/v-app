import { describe, expect, it } from "vitest";

import { profileActivityTimeline, publicDeductionActivity } from "./activity";

describe("publicDeductionActivity", () => {
  const deductions = [
    {
      id: "deduction-1",
      kind: "adjustment" as const,
      xp: -20,
      reason: "Left early",
      date: "2026-11-20T08:15:00.000Z",
    },
    {
      id: "no-show-1",
      kind: "no_show" as const,
      xp: -10,
      date: "2026-10-20T09:00:00.000Z",
      opportunityTitle: "Riverbank clean-up",
      organization: "Volontyorlar",
    },
    {
      id: "reset-1",
      kind: "reset" as const,
      xp: -50,
      date: "2026-10-08T12:00:00.000Z",
    },
  ];

  it("shows a no-show as the missed event and keeps the other losses as deductions", () => {
    const lost = publicDeductionActivity(deductions);

    expect(lost.missed).toEqual([
      {
        id: "no-show-1",
        source: "attendance",
        kind: "volunteering",
        title: "Riverbank clean-up",
        organization: "Volontyorlar",
        eventDate: "2026-10-20T09:00:00.000Z",
        hours: null,
        placement: null,
        xpAwarded: -10,
        countsTowardProgress: true,
        missed: true,
      },
    ]);
    expect(lost.deductions).toEqual([
      {
        id: "deduction-1",
        kind: "adjustment",
        xp: -20,
        reason: "Left early",
        createdAt: "2026-11-20T08:15:00.000Z",
      },
      {
        id: "reset-1",
        kind: "reset",
        xp: -50,
        reason: null,
        createdAt: "2026-10-08T12:00:00.000Z",
      },
    ]);
  });

  it("orders every loss in the timeline by when it happened", () => {
    const lost = publicDeductionActivity(deductions);

    expect(
      profileActivityTimeline(lost.missed, [], lost.deductions).map(
        (entry) => `${entry.source}:${entry.id}`,
      ),
    ).toEqual(["deduction:deduction-1", "attendance:no-show-1", "deduction:reset-1"]);
  });
});
