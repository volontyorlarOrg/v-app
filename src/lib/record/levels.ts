export const LEVELS = [
  "newcomer",
  "volunteer",
  "supervisor",
  "coordinator",
  "leader",
] as const;
export type Level = (typeof LEVELS)[number];

export function isLevel(value: unknown): value is Level {
  return LEVELS.some((level) => level === value);
}

export type LevelStep = { key: Level; minHours: number };

export type NextLevel = LevelStep & { hoursToGo: number };

export type VolunteerProgress = {
  verifiedHours: number;
  xp: number;
  rank: number | null;
  level: Level;
  nextLevel: NextLevel | null;
  levels: readonly LevelStep[];
};

export function ladderProblem(progress: VolunteerProgress): string | null {
  const { levels, level, nextLevel } = progress;
  if (levels[0]?.minHours !== 0) return "the ladder must start at 0 hours";
  for (let index = 1; index < levels.length; index += 1) {
    if (levels[index]!.minHours <= levels[index - 1]!.minHours) {
      return "the ladder must rise step by step";
    }
  }
  if (new Set(levels.map((step) => step.key)).size !== levels.length) {
    return "every level must appear once";
  }
  const current = levels.findIndex((step) => step.key === level);
  if (current < 0) return "the current level must be on the ladder";
  const following = levels[current + 1];
  if (!following) return nextLevel === null ? null : "the top level has no next level";
  if (nextLevel?.key !== following.key || nextLevel.minHours !== following.minHours) {
    return "the next level must be the step after the current one";
  }
  return null;
}

export type LevelState = "reached" | "current" | "next" | "ahead";

export type LevelRow = LevelStep & { state: LevelState; hoursToGo: number | null };

export function levelRows(progress: VolunteerProgress): LevelRow[] {
  const current = progress.levels.findIndex((step) => step.key === progress.level);
  return progress.levels.map((step, index) => {
    const isNext = step.key === progress.nextLevel?.key;
    return {
      ...step,
      state:
        index < current
          ? "reached"
          : index === current
            ? "current"
            : isNext
              ? "next"
              : "ahead",
      hoursToGo: isNext ? (progress.nextLevel?.hoursToGo ?? null) : null,
    };
  });
}

export type LevelMeter = { value: number; max: number };

export function nextLevelMeter(progress: VolunteerProgress): LevelMeter | null {
  if (!progress.nextLevel) return null;
  const floor =
    progress.levels.find((step) => step.key === progress.level)?.minHours ?? 0;
  const max = progress.nextLevel.minHours - floor;
  if (max <= 0) return null;
  return {
    value: Math.min(max, Math.max(0, progress.verifiedHours - floor)),
    max,
  };
}

export type RecordCounts = {
  attended: number;
  acceptedResolved: number;
  acceptedUnconfirmed: number;
};

export type VolunteerRecord = {
  counts: RecordCounts;
  hours?: number;
  hoursVerified: boolean;
};

export const MIN_EVENTS_FOR_RELIABILITY = 3;

export function reliability(counts: RecordCounts): number | null {
  if (counts.acceptedResolved <= 0) return null;
  return Math.min(1, counts.attended / counts.acceptedResolved);
}

export function isReliabilityMeaningful(counts: RecordCounts): boolean {
  return counts.acceptedResolved >= MIN_EVENTS_FOR_RELIABILITY;
}

export function hasParticipation(record: VolunteerRecord): boolean {
  return (
    record.counts.attended > 0 ||
    record.counts.acceptedResolved > 0 ||
    record.counts.acceptedUnconfirmed > 0 ||
    (record.hours ?? 0) > 0
  );
}

export function reliabilityPercent(counts: RecordCounts): number | null {
  const ratio = reliability(counts);
  return ratio === null ? null : Math.round(ratio * 100);
}

export const ATTENDANCE_OUTCOMES = [
  "attended",
  "excused",
  "cancelled",
  "no_show",
  "awaiting_confirmation",
] as const;

export const PLACEMENTS = ["winner", "contributor", "attendee"] as const;

export type Placement = (typeof PLACEMENTS)[number];

export type AttendanceOutcome = (typeof ATTENDANCE_OUTCOMES)[number];

export type ParticipationEntry = {
  id: string;
  source: "attendance" | "manual";
  opportunityTitle: string;
  kind: import("@/lib/opportunities/types").OpportunityKind;
  organization: string;
  eventDate: string;
  eventEndsAt?: string;
  outcome: AttendanceOutcome;
  hours?: number;
  placement?: Placement;
  xpAwarded?: number;
  countsTowardProgress?: boolean;
  applicationId?: string;
  imageUrl?: string;
};
