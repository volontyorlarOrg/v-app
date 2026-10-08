export const CHECKPOINT_GROUPS = [
  "start",
  "applying",
  "events",
  "hours",
  "competitions",
] as const;

export type CheckpointGroup = (typeof CHECKPOINT_GROUPS)[number];

export const CHECKPOINT_KEYS = [
  "profile",
  "first_saved",
  "first_application",
  "first_acceptance",
  "events_1",
  "events_3",
  "events_8",
  "events_20",
  "hours_10",
  "hours_25",
  "hours_50",
  "hours_100",
  "competition_1",
  "competition_win",
] as const;

export type CheckpointKey = (typeof CHECKPOINT_KEYS)[number];

export type CheckpointItem = {
  key: string;
  group: string;
  target: number;
  progress: number;
  xp: number;
  completedAt: string | null;
  claimedAt: string | null;
  rewardState: "locked" | "ready" | "claimed" | "exhausted";
  rewardLimit: number | null;
  rewardsRemaining: number | null;
  rewardReserved: boolean;
};

export type Checkpoint = CheckpointItem & {
  key: CheckpointKey;
  group: CheckpointGroup;
};

export function isCheckpointKey(value: string): value is CheckpointKey {
  return (CHECKPOINT_KEYS as readonly string[]).includes(value);
}

function isCheckpointGroup(value: string): value is CheckpointGroup {
  return (CHECKPOINT_GROUPS as readonly string[]).includes(value);
}

export function knownCheckpoints(items: readonly CheckpointItem[]): Checkpoint[] {
  return items.filter(
    (item): item is Checkpoint =>
      isCheckpointKey(item.key) && isCheckpointGroup(item.group),
  );
}

export function isReached(item: CheckpointItem): boolean {
  return item.completedAt !== null;
}

export function isClaimed(item: CheckpointItem): boolean {
  return item.claimedAt !== null;
}

export function groupedCheckpoints(
  items: readonly Checkpoint[],
): Array<{ group: CheckpointGroup; items: Checkpoint[] }> {
  return CHECKPOINT_GROUPS.flatMap((group) => {
    const members = items.filter((item) => item.group === group);
    return members.length > 0 ? [{ group, items: members }] : [];
  });
}

function seriesOf(item: Checkpoint): string {
  return item.group === "events" || item.group === "hours" ? item.group : item.key;
}

export function nextCheckpoints(items: readonly Checkpoint[], count = 3): Checkpoint[] {
  const series = new Set<string>();
  const next: Checkpoint[] = [];
  const ordered = [
    ...items.filter((item) => item.rewardState === "ready"),
    ...items.filter((item) => !isReached(item) && item.rewardState !== "exhausted"),
  ];
  for (const item of ordered) {
    if (series.has(seriesOf(item))) continue;
    series.add(seriesOf(item));
    next.push(item);
    if (next.length === count) break;
  }
  return next;
}

export function hasCountedProgress(item: CheckpointItem): boolean {
  return item.target > 1;
}
