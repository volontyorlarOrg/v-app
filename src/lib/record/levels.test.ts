import { describe, expect, it } from "vitest";

import {
  isReliabilityMeaningful,
  levelFor,
  levelProgress,
  reachedLevels,
  reliability,
  reliabilityPercent,
  type RecordCounts,
} from "@/lib/record/levels";

function counts(overrides: Partial<RecordCounts> = {}): RecordCounts {
  return {
    attended: 0,
    acceptedResolved: 0,
    acceptedUnconfirmed: 0,
    standoutReviews: false,
    ...overrides,
  };
}

describe("reliability", () => {
  it("is null when nothing has been resolved, not zero", () => {
    expect(reliability(counts())).toBeNull();
    expect(reliability(counts({ acceptedUnconfirmed: 4 }))).toBeNull();
  });

  it("counts only resolved events, so an unconfirming organiser costs nothing", () => {
    const record = counts({
      attended: 5,
      acceptedResolved: 5,
      acceptedUnconfirmed: 10,
    });
    expect(reliability(record)).toBe(1);
    expect(reliabilityPercent(record)).toBe(100);
  });

  it("is the attended share of resolved events", () => {
    expect(reliability(counts({ attended: 17, acceptedResolved: 20 }))).toBeCloseTo(
      0.85,
    );
    expect(reliabilityPercent(counts({ attended: 17, acceptedResolved: 20 }))).toBe(85);
  });

  it("never exceeds 1 even if the backend sends inconsistent counts", () => {
    expect(reliability(counts({ attended: 9, acceptedResolved: 3 }))).toBe(1);
  });

  it("is only meaningful once enough events have resolved", () => {
    expect(isReliabilityMeaningful(counts({ acceptedResolved: 2 }))).toBe(false);
    expect(isReliabilityMeaningful(counts({ acceptedResolved: 3 }))).toBe(true);
  });
});

describe("levelFor", () => {
  it("starts at newcomer", () => {
    expect(levelFor(counts())).toBe("newcomer");
  });

  it("reaches active at three completed events regardless of reliability", () => {
    expect(levelFor(counts({ attended: 2, acceptedResolved: 2 }))).toBe("newcomer");
    expect(levelFor(counts({ attended: 3, acceptedResolved: 3 }))).toBe("active");
  });

  it("requires eight events and 85% reliability for trusted", () => {
    expect(levelFor(counts({ attended: 8, acceptedResolved: 8 }))).toBe("trusted");
    expect(levelFor(counts({ attended: 8, acceptedResolved: 11 }))).toBe("active");
  });

  it("does not award core without an explicit standout-review recognition", () => {
    const qualified = counts({ attended: 25, acceptedResolved: 26 });
    expect(levelFor(qualified)).toBe("trusted");
    expect(levelFor({ ...qualified, standoutReviews: true })).toBe("core");
  });
});

describe("levelProgress", () => {
  it("reports how many more events the next level needs", () => {
    const progress = levelProgress(counts({ attended: 1, acceptedResolved: 1 }));
    expect(progress.current).toBe("newcomer");
    expect(progress.next).toBe("active");
    expect(progress.eventsNeeded).toBe(2);
    expect(progress.blockedByReliability).toBe(false);
  });

  it("distinguishes a reliability block from an event-count block", () => {
    const progress = levelProgress(counts({ attended: 8, acceptedResolved: 11 }));
    expect(progress.current).toBe("active");
    expect(progress.next).toBe("trusted");
    expect(progress.eventsNeeded).toBeNull();
    expect(progress.blockedByReliability).toBe(true);
  });

  it("flags the review requirement separately from the countable ones", () => {
    const progress = levelProgress(counts({ attended: 30, acceptedResolved: 30 }));
    expect(progress.next).toBe("core");
    expect(progress.eventsNeeded).toBeNull();
    expect(progress.blockedByReliability).toBe(false);
    expect(progress.blockedByReview).toBe(true);
  });

  it("has no next level at core", () => {
    const progress = levelProgress(
      counts({ attended: 30, acceptedResolved: 30, standoutReviews: true }),
    );
    expect(progress.current).toBe("core");
    expect(progress.next).toBeNull();
  });
});

describe("reachedLevels", () => {
  it("lists the current level and every one below it, in order", () => {
    expect(reachedLevels("newcomer")).toEqual(["newcomer"]);
    expect(reachedLevels("trusted")).toEqual(["newcomer", "active", "trusted"]);
  });
});
