export const LEVELS = ["newcomer", "active", "trusted", "core"] as const;
export type Level = (typeof LEVELS)[number];

export type RecordCounts = {
  attended: number;
  acceptedResolved: number;
  acceptedUnconfirmed: number;
  standoutReviews: boolean;
};

export type VolunteerRecord = {
  counts: RecordCounts;
  hours?: number;
  hoursVerified: boolean;
};

export const LEVEL_THRESHOLDS = {
  newcomer: { events: 0, reliability: 0 },
  active: { events: 3, reliability: 0 },
  trusted: { events: 8, reliability: 0.85 },
  core: { events: 20, reliability: 0.9 },
} as const satisfies Record<Level, { events: number; reliability: number }>;

export const MIN_EVENTS_FOR_RELIABILITY = 3;

export function reliability(counts: RecordCounts): number | null {
  if (counts.acceptedResolved <= 0) return null;
  return Math.min(1, counts.attended / counts.acceptedResolved);
}

export function isReliabilityMeaningful(counts: RecordCounts): boolean {
  return counts.acceptedResolved >= MIN_EVENTS_FOR_RELIABILITY;
}

export function reliabilityPercent(counts: RecordCounts): number | null {
  const ratio = reliability(counts);
  return ratio === null ? null : Math.round(ratio * 100);
}

export function levelFor(counts: RecordCounts): Level {
  const ratio = reliability(counts) ?? 0;
  const events = counts.attended;

  if (
    events >= LEVEL_THRESHOLDS.core.events &&
    ratio >= LEVEL_THRESHOLDS.core.reliability &&
    counts.standoutReviews
  ) {
    return "core";
  }

  if (
    events >= LEVEL_THRESHOLDS.trusted.events &&
    ratio >= LEVEL_THRESHOLDS.trusted.reliability
  ) {
    return "trusted";
  }

  if (events >= LEVEL_THRESHOLDS.active.events) return "active";

  return "newcomer";
}

export type LevelProgress = {
  current: Level;
  next: Level | null;
  eventsNeeded: number | null;
  blockedByReliability: boolean;
  blockedByReview: boolean;
};

export function levelProgress(counts: RecordCounts): LevelProgress {
  const current = levelFor(counts);
  const next = LEVELS[LEVELS.indexOf(current) + 1] ?? null;

  if (!next) {
    return {
      current,
      next: null,
      eventsNeeded: null,
      blockedByReliability: false,
      blockedByReview: false,
    };
  }

  const threshold = LEVEL_THRESHOLDS[next];
  const ratio = reliability(counts) ?? 0;
  const shortfall = Math.max(0, threshold.events - counts.attended);

  return {
    current,
    next,
    eventsNeeded: shortfall > 0 ? shortfall : null,
    blockedByReliability: shortfall === 0 && ratio < threshold.reliability,
    blockedByReview: next === "core" && shortfall === 0 && !counts.standoutReviews,
  };
}

export function reachedLevels(current: Level): Level[] {
  return LEVELS.slice(0, LEVELS.indexOf(current) + 1);
}

export const ATTENDANCE_OUTCOMES = [
  "attended",
  "excused",
  "cancelled",
  "awaiting_confirmation",
] as const;

export type AttendanceOutcome = (typeof ATTENDANCE_OUTCOMES)[number];

export type ParticipationEntry = {
  id: string;
  opportunityTitle: string;
  organization: string;
  eventDate: string;
  outcome: AttendanceOutcome;
  hours?: number;
};
