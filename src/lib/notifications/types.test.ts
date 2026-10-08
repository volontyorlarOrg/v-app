import { describe, expect, it } from "vitest";

import {
  MERGE_NOTIFICATION_KINDS,
  activityNotification,
  checkpointNotification,
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

  it("reads the backend's completed merge as the approved one", () => {
    expect(mergeNotificationName("account.merge.completed")).toBe("approved");
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

describe("profile reward notifications", () => {
  it("reads a ready reward and the XP it pays", () => {
    expect(
      checkpointNotification("checkpoint.ready", {
        userId: "user-1",
        checkpoints: [{ key: "profile", xp: 50 }],
        xp: 50,
        rewardState: "ready",
      }),
    ).toEqual({ xp: 50, rewardState: "ready" });
  });

  it("follows the backend when the reward was claimed or the places ran out", () => {
    for (const rewardState of ["claimed", "exhausted"] as const)
      expect(
        checkpointNotification("checkpoint.ready", {
          checkpoints: [{ key: "profile", xp: 50 }],
          xp: 50,
          rewardState,
        }),
      ).toEqual({ xp: 50, rewardState });
  });

  it("leaves removed milestones and the automatic-award notices to the backend's own words", () => {
    expect(
      checkpointNotification("checkpoint.ready", {
        checkpoints: [{ key: "events_1", xp: 50 }],
        xp: 50,
      }),
    ).toBeNull();
    expect(
      checkpointNotification("checkpoint.completed", {
        checkpoints: [{ key: "profile", xp: 40 }],
        xp: 40,
      }),
    ).toBeNull();
    expect(
      checkpointNotification("checkpoint.ready", {
        checkpoints: [{ key: "profile", xp: 50 }],
      }),
    ).toBeNull();
    expect(checkpointNotification("checkpoint.ready", null)).toBeNull();
  });
});
