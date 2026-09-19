import { describe, expect, it } from "vitest";

import {
  MERGE_NOTIFICATION_KINDS,
  activityNotification,
  isMergeNotificationKind,
  mergeNotificationName,
} from "@/lib/notifications/types";

describe("merge notifications", () => {
  it("recognises every kind the backend sends about joining accounts", () => {
    for (const kind of MERGE_NOTIFICATION_KINDS) {
      expect(isMergeNotificationKind(kind), kind).toBe(true);
      expect(mergeNotificationName(kind), kind).toBe(kind.split(".").at(-1));
    }
  });

  it("recognises a kind it has no copy for yet without inventing one", () => {
    expect(mergeNotificationName("account.merge.reopened")).toBe("other");
    expect(mergeNotificationName("account.merge")).toBe("other");
  });

  it("leaves every other notification to the backend's own title", () => {
    for (const kind of ["application.accepted", "account.mergers", "", "merge"]) {
      expect(isMergeNotificationKind(kind), kind).toBe(false);
      expect(mergeNotificationName(kind), kind).toBeNull();
    }
  });
});

describe("application and attendance notifications", () => {
  it("reads the decision the backend sends so the bell can say it in the volunteer's language", () => {
    for (const status of ["under_review", "accepted", "rejected", "closed"]) {
      expect(
        activityNotification("application.reviewed", {
          applicationId: "app-1",
          status,
        }),
        status,
      ).toEqual({ name: status, applicationId: "app-1" });
    }
  });

  it("links a submitted application to itself", () => {
    expect(
      activityNotification("application.submitted", {
        applicationId: "app-1",
        volunteerId: "user-1",
      }),
    ).toEqual({ name: "submitted", applicationId: "app-1" });
  });

  it("reads a resolved attendance outcome, which carries no application to link", () => {
    for (const outcome of ["attended", "excused", "cancelled"]) {
      expect(
        activityNotification("attendance.resolved", { attendanceId: "a-1", outcome }),
        outcome,
      ).toEqual({ name: outcome, applicationId: null });
    }
  });

  it("leaves an unknown status or kind to the backend's own words", () => {
    expect(
      activityNotification("application.reviewed", { status: "awaiting_confirmation" }),
    ).toBeNull();
    expect(activityNotification("application.reviewed", null)).toBeNull();
    expect(activityNotification("attendance.resolved", { outcome: 3 })).toBeNull();
    expect(
      activityNotification("opportunity.approved", { opportunityId: "o" }),
    ).toBeNull();
    expect(activityNotification("application.accepted", null)).toBeNull();
  });
});
