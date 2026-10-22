import { describe, expect, it } from "vitest";

import {
  MERGE_NOTIFICATION_KINDS,
  activityNotification,
  checkpointNotification,
  isMergeNotificationKind,
  levelNotification,
  mergeNotificationName,
  pastEventNotification,
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

describe("level notifications", () => {
  it("reads the level reached and the verified hours that reached it", () => {
    expect(
      levelNotification("level.reached", {
        userId: "user-1",
        level: "supervisor",
        minHours: 50,
        verifiedHours: 52.5,
      }),
    ).toEqual({ level: "supervisor", verifiedHours: 52.5 });
  });

  it("leaves a level this build cannot name, or broken hours, to the backend's own words", () => {
    expect(
      levelNotification("level.reached", { level: "legend", verifiedHours: 600 }),
    ).toBeNull();
    expect(
      levelNotification("level.reached", { level: "volunteer", verifiedHours: -1 }),
    ).toBeNull();
    expect(levelNotification("level.reached", { level: "volunteer" })).toBeNull();
    expect(levelNotification("level.reached", null)).toBeNull();
    expect(
      levelNotification("attendance.resolved", {
        level: "volunteer",
        verifiedHours: 12,
      }),
    ).toBeNull();
  });
});

describe("past event notifications", () => {
  it("reads the event, its organization and the XP a volunteer was credited", () => {
    expect(
      pastEventNotification("past_event.credited", {
        userId: "u1",
        title: "Library clean-up",
        organization: "Chilonzor Reading Corners",
        xpAwarded: 40,
      }),
    ).toEqual({
      event: "Library clean-up",
      organization: "Chilonzor Reading Corners",
      xp: 40,
    });
  });

  it("treats missing or odd XP as none, so the sentence never shows a wrong figure", () => {
    for (const xpAwarded of [undefined, 0, -5, 2.5, "40"]) {
      expect(
        pastEventNotification("past_event.credited", {
          title: "Library clean-up",
          organization: "Readers",
          xpAwarded,
        })?.xp,
      ).toBe(0);
    }
  });

  it("leaves the backend's own wording when the event or organization is missing", () => {
    expect(
      pastEventNotification("past_event.credited", { organization: "Readers" }),
    ).toBeNull();
    expect(
      pastEventNotification("past_event.credited", { title: "Library clean-up" }),
    ).toBeNull();
    expect(
      pastEventNotification("attendance.resolved", {
        title: "Library clean-up",
        organization: "Readers",
      }),
    ).toBeNull();
  });
});
