import { describe, expect, it } from "vitest";

import {
  APPLICATION_STATUSES,
  applicationGroup,
  applicationTimeline,
  canWithdraw,
  inApplicationGroup,
  isApplicationGroup,
  isEditable,
  isTerminal,
  isUpcomingCommitment,
  isWithdrawable,
  decidedAt,
  type ApplicationStatus,
  type ApplicationSummary,
} from "@/lib/applications/status";
import type { OpportunitySummary } from "@/lib/opportunities/types";

const NOW = new Date("2026-06-15T12:00:00.000Z");

function opportunity(startsAt: string): OpportunitySummary {
  return {
    id: "riverbank",
    slug: "riverbank-clean-up",
    title: "Riverbank clean-up",
    summary: "",
    organization: { id: "green", name: "Green Corridor Group", slug: "green", verified: false },
    region: "samarkand",
    format: "onsite",
    status: "open",
    startsAt,
    applicationDeadline: startsAt,
  };
}

function application(status: ApplicationStatus, startsAt: string): ApplicationSummary {
  return {
    id: `application-${status}`,
    status,
    opportunity: opportunity(startsAt),
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-06-03T10:00:00.000Z",
  };
}

describe("application status predicates", () => {
  it("only lets a draft be edited", () => {
    expect(APPLICATION_STATUSES.filter(isEditable)).toEqual(["draft"]);
  });

  it("allows withdrawal while the organiser still holds the application", () => {
    expect(APPLICATION_STATUSES.filter(isWithdrawable)).toEqual([
      "submitted",
      "under_review",
      "accepted",
    ]);
  });

  it("treats rejected, withdrawn and closed as final", () => {
    expect(APPLICATION_STATUSES.filter(isTerminal)).toEqual([
      "rejected",
      "withdrawn",
      "closed",
    ]);
  });
});

describe("application groups", () => {
  it("sorts every status into exactly one group", () => {
    expect(applicationGroup("draft")).toBe("drafts");
    expect(applicationGroup("submitted")).toBe("active");
    expect(applicationGroup("under_review")).toBe("active");
    for (const status of ["accepted", "rejected", "withdrawn", "closed"] as const) {
      expect(applicationGroup(status)).toBe("decided");
    }
  });

  it("matches everything for the all group and validates group names", () => {
    expect(
      APPLICATION_STATUSES.every((status) => inApplicationGroup(status, "all")),
    ).toBe(true);
    expect(isApplicationGroup("drafts")).toBe(true);
    expect(isApplicationGroup("nonsense")).toBe(false);
  });
});

describe("applicationTimeline", () => {
  it("shows the whole journey ahead of a draft", () => {
    expect(
      applicationTimeline(
        { status: "draft", updatedAt: "2026-06-01T10:00:00.000Z" },
        NOW,
      ).map((entry) => entry.state),
    ).toEqual(["current", "pending", "pending", "pending", "pending"]);
  });

  it("moves the current marker with the status and carries dates", () => {
    const review = applicationTimeline(
      {
        status: "under_review",
        submittedAt: "2026-06-01T10:00:00.000Z",
        reviewedAt: "2026-06-02T10:00:00.000Z",
        updatedAt: "2026-06-02T10:00:00.000Z",
      },
      NOW,
    );
    expect(review.map((entry) => entry.state)).toEqual([
      "done",
      "current",
      "pending",
      "pending",
      "pending",
    ]);
    expect(review[0]?.at).toBe("2026-06-01T10:00:00.000Z");
  });

  it("ends the journey where a negative decision ends it", () => {
    for (const status of ["rejected", "withdrawn", "closed"] as const) {
      const entries = applicationTimeline(
        { status, updatedAt: "2026-06-04T10:00:00.000Z" },
        NOW,
      );
      expect(entries).toHaveLength(3);
      expect(entries.every((entry) => entry.state === "done")).toBe(true);
    }
  });

  it("waits on the event once the volunteer is accepted", () => {
    const entries = applicationTimeline(
      {
        status: "accepted",
        submittedAt: "2026-06-01T10:00:00.000Z",
        reviewedAt: "2026-06-02T10:00:00.000Z",
        updatedAt: "2026-06-02T10:00:00.000Z",
        opportunity: { startsAt: "2026-06-25T09:00:00.000Z" },
      },
      NOW,
    );
    expect(entries.map((entry) => entry.state)).toEqual([
      "done",
      "done",
      "done",
      "pending",
      "pending",
    ]);
  });

  it("asks for attendance once the event has ended", () => {
    const entries = applicationTimeline(
      {
        status: "accepted",
        submittedAt: "2026-06-01T10:00:00.000Z",
        reviewedAt: "2026-06-02T10:00:00.000Z",
        updatedAt: "2026-06-02T10:00:00.000Z",
        opportunity: {
          startsAt: "2026-06-10T09:00:00.000Z",
          endsAt: "2026-06-10T15:00:00.000Z",
        },
      },
      NOW,
    );
    expect(entries.map((entry) => entry.state)).toEqual([
      "done",
      "done",
      "done",
      "done",
      "current",
    ]);
  });

  it("completes the journey once attendance is confirmed", () => {
    const entries = applicationTimeline(
      {
        status: "accepted",
        submittedAt: "2026-06-01T10:00:00.000Z",
        reviewedAt: "2026-06-02T10:00:00.000Z",
        updatedAt: "2026-06-02T10:00:00.000Z",
        opportunity: {
          startsAt: "2026-06-10T09:00:00.000Z",
          endsAt: "2026-06-10T15:00:00.000Z",
        },
        attendance: {
          outcome: "attended",
          confirmedHours: 4,
          resolvedAt: "2026-06-11T09:00:00.000Z",
        },
      },
      NOW,
    );
    expect(entries[4]).toEqual({
      step: "attendance",
      state: "done",
      at: "2026-06-11T09:00:00.000Z",
    });
  });
});

describe("canWithdraw", () => {
  const ahead = "2026-06-25T09:00:00.000Z";
  const behind = "2026-06-05T09:00:00.000Z";

  it("lets a volunteer withdraw while the organiser still holds the application", () => {
    for (const status of ["submitted", "under_review"] as const) {
      expect(canWithdraw(application(status, ahead), NOW)).toBe(true);
    }
  });

  it("lets an accepted volunteer withdraw before the event starts", () => {
    expect(canWithdraw(application("accepted", ahead), NOW)).toBe(true);
  });

  it("refuses once the event has started", () => {
    expect(canWithdraw(application("accepted", behind), NOW)).toBe(false);
  });

  it("refuses once attendance has been resolved, so a record cannot be erased", () => {
    expect(
      canWithdraw(
        {
          ...application("accepted", ahead),
          attendance: { outcome: "attended", confirmedHours: 4 },
        },
        NOW,
      ),
    ).toBe(false);
  });

  it("leaves an awaiting attendance record withdrawable before the event", () => {
    expect(
      canWithdraw(
        {
          ...application("accepted", ahead),
          attendance: { outcome: "awaiting_confirmation" },
        },
        NOW,
      ),
    ).toBe(true);
  });

  it("never withdraws something already finished", () => {
    for (const status of ["draft", "rejected", "withdrawn", "closed"] as const) {
      expect(canWithdraw(application(status, ahead), NOW)).toBe(false);
    }
  });
});

describe("decidedAt", () => {
  const dates = {
    reviewedAt: "2026-06-02T10:00:00.000Z",
    withdrawnAt: "2026-06-03T10:00:00.000Z",
    updatedAt: "2026-06-04T10:00:00.000Z",
  };

  it("uses the withdrawal date for a withdrawn application", () => {
    expect(decidedAt({ status: "withdrawn", ...dates })).toBe(dates.withdrawnAt);
  });

  it("uses the review date for an organiser decision", () => {
    expect(decidedAt({ status: "accepted", ...dates })).toBe(dates.reviewedAt);
    expect(decidedAt({ status: "rejected", ...dates })).toBe(dates.reviewedAt);
  });

  it("falls back to the last update when the decision has no date of its own", () => {
    expect(decidedAt({ status: "closed", ...dates })).toBe(dates.updatedAt);
    expect(decidedAt({ status: "accepted", updatedAt: dates.updatedAt })).toBe(dates.updatedAt);
  });

  it("has no decision while the application is still open", () => {
    for (const status of ["draft", "submitted", "under_review"] as const) {
      expect(decidedAt({ status, ...dates })).toBeUndefined();
    }
  });
});

describe("isUpcomingCommitment", () => {
  const ahead = "2026-06-25T09:00:00.000Z";
  const behind = "2026-06-05T09:00:00.000Z";

  it("is an accepted application whose event is still ahead", () => {
    expect(isUpcomingCommitment(application("accepted", ahead), NOW)).toBe(true);
  });

  it("is not an accepted application whose event has passed", () => {
    expect(isUpcomingCommitment(application("accepted", behind), NOW)).toBe(false);
  });

  it("is never an application the organiser has not accepted", () => {
    for (const status of ["draft", "submitted", "under_review", "rejected"] as const) {
      expect(isUpcomingCommitment(application(status, ahead), NOW)).toBe(false);
    }
  });
});
