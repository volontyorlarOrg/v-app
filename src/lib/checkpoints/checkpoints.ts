import { profileCompletion, type ProfileFields } from "@/lib/profile/completion";

export const CHECKPOINT_KEYS = ["profile"] as const;

export const PROFILE_TASK_ANCHOR = "task-profile";

export type CheckpointKey = (typeof CHECKPOINT_KEYS)[number];

export type RewardState = "locked" | "ready" | "claimed" | "exhausted";

export type CheckpointItem = {
  key: string;
  group: string;
  target: number;
  progress: number;
  xp: number;
  completedAt: string | null;
  claimedAt: string | null;
  rewardState: RewardState;
  rewardLimit: number | null;
  rewardsRemaining: number | null;
  rewardReserved: boolean;
};

export type Checkpoint = CheckpointItem & { key: CheckpointKey };

export function isCheckpointKey(value: string): value is CheckpointKey {
  return (CHECKPOINT_KEYS as readonly string[]).includes(value);
}

export function profileReward(items: readonly CheckpointItem[]): Checkpoint | null {
  return items.find((item): item is Checkpoint => item.key === "profile") ?? null;
}

export type RewardPlaces = { limit: number; claimed: number; remaining: number };

export function rewardPlaces(reward: CheckpointItem): RewardPlaces | null {
  if (reward.rewardLimit === null || reward.rewardsRemaining === null) return null;
  const remaining = Math.min(reward.rewardsRemaining, reward.rewardLimit);
  return {
    limit: reward.rewardLimit,
    claimed: reward.rewardLimit - remaining,
    remaining,
  };
}

export const PROFILE_TASK_ITEMS = [
  { id: "photo", fields: [] },
  { id: "name", fields: ["fullName"] },
  { id: "username", fields: [] },
  { id: "telegram", fields: ["telegram"] },
  { id: "languages", fields: ["languages"] },
  { id: "place", fields: ["region", "city"] },
  { id: "school", fields: ["school", "gradeYear"] },
  { id: "bio", fields: ["bio"] },
] as const;

export type ProfileTaskItemId = (typeof PROFILE_TASK_ITEMS)[number]["id"];

export type ProfileTaskItem = { id: ProfileTaskItemId; done: boolean };

export function profileTaskChecklist(
  profile: ProfileFields,
  usernameChosen: boolean,
  hasPhoto: boolean,
): ProfileTaskItem[] {
  const { missing } = profileCompletion(profile);
  return PROFILE_TASK_ITEMS.map((item) => ({
    id: item.id,
    done:
      item.id === "photo"
        ? hasPhoto
        : item.id === "username"
          ? usernameChosen
          : item.fields.every((field) => !missing.includes(field)),
  }));
}
