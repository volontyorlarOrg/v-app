import type {
  PublicDeduction,
  RewardHistoryEntry,
  XpDeduction,
} from "@/lib/api/schemas";
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
  missed?: boolean;
};

export function profileActivityTimeline(
  entries: readonly ProfileActivityEntry[],
  rewards: readonly RewardHistoryEntry[],
  deductions: readonly XpDeduction[] = [],
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
    ...deductions.map((deduction) => ({
      ...deduction,
      source: "deduction" as const,
      eventDate: deduction.createdAt,
    })),
  ].sort((a, b) => activityTime(b.eventDate) - activityTime(a.eventDate));
}

function activityTime(value: string) {
  return Date.parse(value.length === 10 ? `${value}T00:00:00+05:00` : value);
}

export function publicDeductionActivity(deductions: readonly PublicDeduction[]) {
  const missed: ProfileActivityEntry[] = [];
  const taken: XpDeduction[] = [];
  for (const deduction of deductions) {
    if (deduction.kind === "no_show") {
      missed.push({
        id: deduction.id,
        source: "attendance",
        kind: "volunteering",
        title: deduction.opportunityTitle,
        organization: deduction.organization ?? "",
        eventDate: deduction.date,
        hours: null,
        placement: null,
        xpAwarded: deduction.xp,
        countsTowardProgress: true,
        missed: true,
      });
    } else {
      taken.push({
        id: deduction.id,
        kind: deduction.kind,
        xp: deduction.xp,
        reason: deduction.kind === "adjustment" ? deduction.reason : null,
        createdAt: deduction.date,
      });
    }
  }
  return { missed, deductions: taken };
}
