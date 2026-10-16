import { describe, expect, it } from "vitest";

import {
  hasParticipation,
  isReliabilityMeaningful,
  ladderProblem,
  levelRows,
  nextLevelMeter,
  reliability,
  reliabilityPercent,
  type LevelStep,
  type RecordCounts,
  type VolunteerProgress,
} from "@/lib/record/levels";

function counts(overrides: Partial<RecordCounts> = {}): RecordCounts {
  return {
    attended: 0,
    acceptedResolved: 0,
    acceptedUnconfirmed: 0,
    ...overrides,
  };
}

const LADDER: LevelStep[] = [
  { key: "newcomer", minHours: 0 },
  { key: "volunteer", minHours: 10 },
  { key: "supervisor", minHours: 50 },
  { key: "coordinator", minHours: 100 },
  { key: "leader", minHours: 250 },
];

function progress(overrides: Partial<VolunteerProgress> = {}): VolunteerProgress {
  return {
    verifiedHours: 12,
    xp: 170,
    rank: 42,
    level: "volunteer",
    nextLevel: { key: "supervisor", minHours: 50, hoursToGo: 38 },
    levels: LADDER,
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

describe("the ladder the backend serves", () => {
  it("accepts a ladder that rises from zero with the next step after the current one", () => {
    expect(ladderProblem(progress())).toBeNull();
    expect(
      ladderProblem(progress({ verifiedHours: 300, level: "leader", nextLevel: null })),
    ).toBeNull();
  });

  it("refuses a ladder that does not start at zero", () => {
    expect(
      ladderProblem(
        progress({ levels: [{ key: "newcomer", minHours: 1 }, ...LADDER] }),
      ),
    ).not.toBeNull();
  });

  it("refuses a ladder that falls or repeats a step", () => {
    expect(
      ladderProblem(
        progress({
          levels: [LADDER[0]!, LADDER[2]!, LADDER[1]!, LADDER[3]!, LADDER[4]!],
        }),
      ),
    ).not.toBeNull();
    expect(
      ladderProblem(
        progress({ levels: [...LADDER, { key: "leader", minHours: 500 }] }),
      ),
    ).not.toBeNull();
  });

  it("refuses a current level that is not on the ladder", () => {
    expect(ladderProblem(progress({ levels: LADDER.slice(0, 1) }))).not.toBeNull();
  });

  it("refuses a next level that skips a step or disagrees with the ladder", () => {
    expect(
      ladderProblem(
        progress({ nextLevel: { key: "coordinator", minHours: 100, hoursToGo: 88 } }),
      ),
    ).not.toBeNull();
    expect(
      ladderProblem(
        progress({ nextLevel: { key: "supervisor", minHours: 40, hoursToGo: 28 } }),
      ),
    ).not.toBeNull();
    expect(ladderProblem(progress({ nextLevel: null }))).not.toBeNull();
    expect(
      ladderProblem(
        progress({
          level: "leader",
          nextLevel: { key: "supervisor", minHours: 50, hoursToGo: 1 },
        }),
      ),
    ).not.toBeNull();
  });
});

describe("the rows of the levels dialog", () => {
  it("marks the steps below as reached, the current one, the next one and the rest", () => {
    expect(
      levelRows(progress()).map(({ key, state, hoursToGo }) => [key, state, hoursToGo]),
    ).toEqual([
      ["newcomer", "reached", null],
      ["volunteer", "current", null],
      ["supervisor", "next", 38],
      ["coordinator", "ahead", null],
      ["leader", "ahead", null],
    ]);
  });

  it("has nothing ahead on the top step", () => {
    const rows = levelRows(
      progress({ verifiedHours: 260, level: "leader", nextLevel: null }),
    );
    expect(rows.map((row) => row.state)).toEqual([
      "reached",
      "reached",
      "reached",
      "reached",
      "current",
    ]);
  });

  it("keeps the hours of each step from the ladder", () => {
    expect(levelRows(progress()).map((row) => row.minHours)).toEqual([
      0, 10, 50, 100, 250,
    ]);
  });
});

describe("the meter toward the next level", () => {
  it("measures the hours made inside the current step, not from zero", () => {
    expect(nextLevelMeter(progress())).toEqual({ value: 2, max: 40 });
  });

  it("starts empty on a new step and keeps decimals", () => {
    expect(
      nextLevelMeter(
        progress({
          verifiedHours: 0,
          level: "newcomer",
          nextLevel: { key: "volunteer", minHours: 10, hoursToGo: 10 },
        }),
      ),
    ).toEqual({ value: 0, max: 10 });
    expect(
      nextLevelMeter(
        progress({
          verifiedHours: 52.5,
          level: "supervisor",
          nextLevel: { key: "coordinator", minHours: 100, hoursToGo: 47.5 },
        }),
      ),
    ).toEqual({ value: 2.5, max: 50 });
  });

  it("is absent on the top step", () => {
    expect(
      nextLevelMeter(
        progress({ verifiedHours: 300, level: "leader", nextLevel: null }),
      ),
    ).toBeNull();
  });
});

describe("hasParticipation", () => {
  const empty = { counts: counts(), hoursVerified: true };

  it("is false for a volunteer with nothing on the record yet", () => {
    expect(hasParticipation(empty)).toBe(false);
    expect(hasParticipation({ ...empty, hours: 0 })).toBe(false);
  });

  it("is true once any event is accepted, resolved or attended", () => {
    expect(
      hasParticipation({ ...empty, counts: counts({ acceptedUnconfirmed: 1 }) }),
    ).toBe(true);
    expect(
      hasParticipation({ ...empty, counts: counts({ acceptedResolved: 1 }) }),
    ).toBe(true);
    expect(hasParticipation({ ...empty, hours: 2 })).toBe(true);
  });
});
