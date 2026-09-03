import { describe, expect, it } from "vitest";

import {
  APPLICATION_STATUSES,
  applicationGroup,
  applicationTimeline,
  inApplicationGroup,
  isApplicationGroup,
  isEditable,
  isTerminal,
  isUpcomingCommitment,
  isWithdrawable,
} from "@/lib/applications/status";
import { sampleVolunteer } from "@/lib/sample/volunteer";

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
  it("keeps a draft on the first step", () => {
    expect(
      applicationTimeline({ status: "draft" }).map((entry) => entry.state),
    ).toEqual(["current", "pending", "pending"]);
  });

  it("moves the current marker with the status and carries dates", () => {
    const review = applicationTimeline({
      status: "under_review",
      submittedAt: "2026-06-01T10:00:00.000Z",
      reviewedAt: "2026-06-02T10:00:00.000Z",
    });
    expect(review.map((entry) => entry.state)).toEqual(["done", "current", "pending"]);
    expect(review[0]?.at).toBe("2026-06-01T10:00:00.000Z");
  });

  it("completes every step once a decision exists", () => {
    for (const status of ["accepted", "rejected", "withdrawn", "closed"] as const) {
      expect(
        applicationTimeline({ status }).every((entry) => entry.state === "done"),
      ).toBe(true);
    }
  });
});

describe("isUpcomingCommitment", () => {
  const now = new Date("2026-06-15T12:00:00.000Z");

  it("is an accepted application whose event is still ahead", () => {
    const upcoming = sampleVolunteer(now).applications.filter((application) =>
      isUpcomingCommitment(application, now),
    );
    expect(upcoming.map((application) => application.status)).toEqual([
      "accepted",
      "accepted",
    ]);
    for (const application of upcoming) {
      expect(new Date(application.opportunity.startsAt).getTime()).toBeGreaterThan(
        now.getTime(),
      );
    }
  });
});
