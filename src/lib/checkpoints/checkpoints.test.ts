import { describe, expect, it } from "vitest";

import { EMPTY_PROFILE, type ProfileFields } from "@/lib/profile/completion";

import {
  CHECKPOINT_KEYS,
  PROFILE_TASK_ITEMS,
  isCheckpointKey,
  profileReward,
  profileTaskChecklist,
  rewardPlaces,
  type CheckpointItem,
} from "./checkpoints";

function item(key: string, overrides: Partial<CheckpointItem> = {}): CheckpointItem {
  return {
    key,
    group: "start",
    target: 1,
    progress: 0,
    xp: 50,
    completedAt: null,
    claimedAt: null,
    rewardState: "locked",
    rewardLimit: 1000,
    rewardsRemaining: 300,
    rewardReserved: false,
    ...overrides,
  };
}

const COMPLETE: ProfileFields = {
  fullName: "Aziza Karimova",
  bio: "I like helping at school events.",
  region: "tashkent-city",
  city: "Tashkent",
  school: "School 110",
  gradeYear: "10",
  languages: ["uz"],
  phone: "",
  telegram: "aziza_k",
};

describe("the profile reward", () => {
  it("is the only task the backend catalog sends", () => {
    expect(CHECKPOINT_KEYS).toEqual(["profile"]);
    expect(isCheckpointKey("profile")).toBe(true);
    for (const removed of ["events_1", "username", "first_saved", "photo"])
      expect(isCheckpointKey(removed)).toBe(false);
  });

  it("picks the profile reward and ignores keys this build has no copy for", () => {
    expect(profileReward([item("events_1"), item("profile", { xp: 50 })])?.xp).toBe(50);
    expect(profileReward([item("events_1")])).toBeNull();
    expect(profileReward([])).toBeNull();
  });

  it("reads the claimed count from the places left", () => {
    expect(rewardPlaces(item("profile", { rewardsRemaining: 300 }))).toEqual({
      limit: 1000,
      claimed: 700,
      remaining: 300,
    });
    expect(rewardPlaces(item("profile", { rewardsRemaining: 0 }))).toEqual({
      limit: 1000,
      claimed: 1000,
      remaining: 0,
    });
    expect(rewardPlaces(item("profile", { rewardLimit: null }))).toBeNull();
  });
});

describe("the profile checklist", () => {
  it("covers every field the backend requires, grouped as the task shows them", () => {
    expect(PROFILE_TASK_ITEMS.flatMap((entry) => entry.fields).sort()).toEqual([
      "bio",
      "city",
      "fullName",
      "gradeYear",
      "languages",
      "region",
      "school",
      "telegram",
    ]);
  });

  it("marks everything done for a complete profile with a chosen username", () => {
    const checklist = profileTaskChecklist(COMPLETE, true, true);
    expect(checklist).toHaveLength(8);
    expect(checklist.every((entry) => entry.done)).toBe(true);
  });

  it("keeps the photo missing even when every profile field is complete", () => {
    expect(
      profileTaskChecklist(COMPLETE, true, false).filter((entry) => !entry.done),
    ).toEqual([{ id: "photo", done: false }]);
  });

  it("needs both fields of a pair before the pair is done", () => {
    const checklist = profileTaskChecklist(
      { ...COMPLETE, city: "", gradeYear: " " },
      true,
      true,
    );
    expect(checklist.filter((entry) => !entry.done).map((entry) => entry.id)).toEqual([
      "place",
      "school",
    ]);
  });

  it("starts empty for a new account and counts the username on its own", () => {
    const checklist = profileTaskChecklist(EMPTY_PROFILE, false, false);
    expect(checklist.some((entry) => entry.done)).toBe(false);
    expect(
      profileTaskChecklist(EMPTY_PROFILE, true, false).filter((entry) => entry.done),
    ).toEqual([{ id: "username", done: true }]);
  });
});
