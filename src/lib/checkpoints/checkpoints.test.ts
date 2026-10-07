import { describe, expect, it } from "vitest";

import {
  CHECKPOINT_KEYS,
  groupedCheckpoints,
  hasCountedProgress,
  isCheckpointKey,
  knownCheckpoints,
  nextCheckpoints,
  type CheckpointItem,
} from "./checkpoints";

function item(
  key: string,
  group: string,
  overrides: Partial<CheckpointItem> = {},
): CheckpointItem {
  return {
    key,
    group,
    target: 1,
    progress: 0,
    xp: 10,
    completedAt: null,
    ...overrides,
  };
}

const REACHED = "2026-10-07T09:00:00.000Z";

describe("checkpoints", () => {
  it("knows the seventeen keys the backend catalog sends", () => {
    expect(CHECKPOINT_KEYS).toHaveLength(17);
    expect(isCheckpointKey("profile")).toBe(true);
    expect(isCheckpointKey("photo")).toBe(false);
  });

  it("drops a key this build has no copy for instead of failing the page", () => {
    const items = knownCheckpoints([
      item("profile", "start"),
      item("brand_new", "start"),
      item("username", "brand_new_group"),
    ]);

    expect(items.map((entry) => entry.key)).toEqual(["profile"]);
  });

  it("groups in the product's order and leaves out a group with nothing in it", () => {
    const groups = groupedCheckpoints(
      knownCheckpoints([
        item("hours_10", "hours", { target: 10 }),
        item("username", "start"),
        item("profile", "start"),
      ]),
    );

    expect(groups.map((group) => group.group)).toEqual(["start", "hours"]);
    expect(groups[0]?.items.map((entry) => entry.key)).toEqual(["username", "profile"]);
  });

  it("suggests the next open checkpoints, one tier per series, in catalog order", () => {
    const next = nextCheckpoints(
      knownCheckpoints([
        item("username", "start", { completedAt: REACHED, progress: 1 }),
        item("profile", "start"),
        item("events_1", "events", { completedAt: REACHED, progress: 1 }),
        item("events_3", "events", { target: 3, progress: 1 }),
        item("events_8", "events", { target: 8, progress: 1 }),
        item("hours_10", "hours", { target: 10, progress: 4 }),
        item("hours_25", "hours", { target: 25, progress: 4 }),
      ]),
    );

    expect(next.map((entry) => entry.key)).toEqual(["profile", "events_3", "hours_10"]);
  });

  it("suggests nothing once every checkpoint is reached", () => {
    expect(
      nextCheckpoints(
        knownCheckpoints([item("profile", "start", { completedAt: REACHED })]),
      ),
    ).toEqual([]);
  });

  it("draws a progress count only for checkpoints with more than one step", () => {
    expect(hasCountedProgress(item("profile", "start"))).toBe(false);
    expect(hasCountedProgress(item("hours_10", "hours", { target: 10 }))).toBe(true);
  });
});
