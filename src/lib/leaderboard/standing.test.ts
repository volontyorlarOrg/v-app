import { describe, expect, it } from "vitest";

import { chaseOf, entryAt, pageOfRank, placeAhead } from "@/lib/leaderboard/standing";

describe("the page a place sits on", () => {
  it("counts whole pages of the default size", () => {
    expect(pageOfRank(1)).toBe(1);
    expect(pageOfRank(25)).toBe(1);
    expect(pageOfRank(26)).toBe(2);
    expect(pageOfRank(143)).toBe(6);
  });

  it("follows the page size it is given", () => {
    expect(pageOfRank(30, 10)).toBe(3);
    expect(pageOfRank(31, 10)).toBe(4);
  });

  it("falls back to the first page and the default size on nonsense", () => {
    expect(pageOfRank(0)).toBe(1);
    expect(pageOfRank(Number.NaN)).toBe(1);
    expect(pageOfRank(26, 0)).toBe(2);
  });
});

describe("the place ahead", () => {
  it("is the place one higher, and nothing for the leader", () => {
    expect(placeAhead(30)).toBe(29);
    expect(placeAhead(2)).toBe(1);
    expect(placeAhead(1)).toBeNull();
  });

  it("is read from the entries a page already holds", () => {
    const entries = [
      { rank: 28, xp: 570 },
      { rank: 29, xp: 480 },
    ];
    expect(entryAt(entries, 29)).toEqual({ rank: 29, xp: 480 });
    expect(entryAt(entries, 27)).toBeNull();
    expect(entryAt(entries, null)).toBeNull();
  });
});

describe("the distance to the place ahead", () => {
  it("names the experience missing to the next place", () => {
    expect(chaseOf({ rank: 30, xp: 320 }, { rank: 29, xp: 480 })).toEqual({
      kind: "behind",
      place: 29,
      xp: 160,
    });
  });

  it("calls equal experience level rather than zero behind", () => {
    expect(chaseOf({ rank: 30, xp: 480 }, { rank: 29, xp: 480 })).toEqual({
      kind: "level",
      place: 29,
    });
  });

  it("has the leader leading without needing anyone ahead", () => {
    expect(chaseOf({ rank: 1, xp: 3000 }, null)).toEqual({ kind: "leading" });
  });

  it("says nothing when the place ahead is unknown or no longer adjacent", () => {
    expect(chaseOf({ rank: 30, xp: 320 }, null)).toBeNull();
    expect(chaseOf({ rank: 30, xp: 320 }, { rank: 27, xp: 660 })).toBeNull();
    expect(chaseOf({ rank: 30, xp: 500 }, { rank: 29, xp: 480 })).toBeNull();
  });
});
