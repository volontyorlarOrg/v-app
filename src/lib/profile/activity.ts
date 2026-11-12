import type { RewardHistoryEntry } from "@/lib/api/schemas";
import type { Placement } from "@/lib/record/levels";

export type ProfileActivityEntry = {
  id: string;
  source: "attendance" | "manual";
  kind: "volunteering" | "competition";
  title: string;
  organization: string;
  eventDate: string;
  hours: number | null;
  placement: Placement | null;
  xpAwarded: number;
  countsTowardProgress: boolean;
};

export function profileActivityTimeline(
  entries: readonly ProfileActivityEntry[],
  rewards: readonly RewardHistoryEntry[],
) {
  return [
    ...entries,
    ...rewards
      .filter((reward) => reward.key === "profile")
      .map((reward) => ({
        ...reward,
        source: "checkpoint" as const,
        eventDate: reward.claimedAt,
      })),
  ].sort((a, b) => activityTime(b.eventDate) - activityTime(a.eventDate));
}

function activityTime(value: string) {
  return Date.parse(value.length === 10 ? `${value}T00:00:00+05:00` : value);
}
