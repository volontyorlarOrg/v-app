import { z } from "zod";

/**
 * THE canonical volunteer level and reliability definition.
 *
 * The handoff is emphatic that reputation is high-trust data: no invented
 * formulas, no arbitrary stars, one canonical location, labels derived from
 * backend truth. This module is that location. If a level threshold appears
 * anywhere else in the codebase, that is the bug.
 *
 * Source of the thresholds: `PRODUCT.md` in the YVC marketing repository
 * (volontyorlarOrg/v-web), which states:
 *
 *   | Newcomer | Joined the community                                        |
 *   | Active   | Completed 3 events                                          |
 *   | Trusted  | Completed 8 events with at least 85% reliability             |
 *   | Core     | Completed 20 events, at least 90% reliability, and standout  |
 *   |          | reviews                                                     |
 *
 *   "Reliability is the percentage of accepted events a volunteer attended. A
 *    volunteer must not be penalized when an organizer fails to confirm
 *    attendance."
 *
 * @see docs/features/volunteer-record.md
 */

export const LEVELS = ["newcomer", "active", "trusted", "core"] as const;
export type Level = (typeof LEVELS)[number];

/**
 * The inputs a level is computed from.
 *
 * `acceptedUnconfirmed` is separate from `accepted` on purpose and is the most
 * important field here. An organiser who never confirms attendance is an
 * organiser problem; counting those events as "accepted but not attended"
 * would silently push a reliable volunteer's score down for someone else's
 * inaction. They are excluded from the denominator entirely.
 */
export const recordCountsSchema = z.object({
  /** Events attended and confirmed by an organiser. */
  attended: z.number().int().nonnegative(),
  /** Events accepted to *and* resolved by an organiser either way. */
  acceptedResolved: z.number().int().nonnegative(),
  /** Accepted, event has passed, organiser never said. Excluded from maths. */
  acceptedUnconfirmed: z.number().int().nonnegative().default(0),
  /**
   * Whether YVC has recognised standout reviews.
   *
   * "Standout reviews" is not a computable criterion and there is no review
   * backend, so this is a flag the backend grants — never something this
   * module infers. Until it exists, `core` is unreachable, which is the
   * correct behaviour: it is better for a level to be unavailable than
   * awarded by a formula nobody agreed to.
   */
  standoutReviews: z.boolean().default(false),
});

export type RecordCounts = z.infer<typeof recordCountsSchema>;

export const LEVEL_THRESHOLDS = {
  newcomer: { events: 0, reliability: 0 },
  active: { events: 3, reliability: 0 },
  trusted: { events: 8, reliability: 0.85 },
  core: { events: 20, reliability: 0.9 },
} as const satisfies Record<Level, { events: number; reliability: number }>;

/**
 * Reliability as a 0–1 ratio, or `null` when it cannot honestly be stated.
 *
 * `null` — not 0, and not 1 — is returned when no event has been resolved.
 * A volunteer with one accepted, unconfirmed event has no reliability yet;
 * rendering that as "0%" would accuse them of not showing up, and rendering it
 * as "100%" would be an unearned claim.
 */
export function reliability(counts: RecordCounts): number | null {
  if (counts.acceptedResolved <= 0) return null;
  return Math.min(1, counts.attended / counts.acceptedResolved);
}

/**
 * Reliability is only meaningful once there is something to average. Below
 * this, the UI shows "not enough confirmed events yet" rather than a
 * percentage that one absence would swing by 50 points.
 */
export const MIN_EVENTS_FOR_RELIABILITY = 3;

export function isReliabilityMeaningful(counts: RecordCounts): boolean {
  return counts.acceptedResolved >= MIN_EVENTS_FOR_RELIABILITY;
}

/** The highest level whose stated conditions are met. */
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
  /** Confirmed events still needed for `next`, or `null` if not the blocker. */
  eventsNeeded: number | null;
  /** True when `next` is blocked by reliability rather than event count. */
  blockedByReliability: boolean;
  /** True when `next` needs a recognition this module cannot compute. */
  blockedByReview: boolean;
};

/**
 * What stands between the volunteer and the next level.
 *
 * Distinguishing "attend 2 more events" from "your reliability is below 85%"
 * matters: the first is an instruction, the second is not something more
 * attendance alone fixes quickly.
 */
export function levelProgress(counts: RecordCounts): LevelProgress {
  const current = levelFor(counts);
  const currentIndex = LEVELS.indexOf(current);
  const next = LEVELS[currentIndex + 1] ?? null;

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

/** Percentage for display. Rounded once, here, so no two views disagree. */
export function reliabilityPercent(counts: RecordCounts): number | null {
  const ratio = reliability(counts);
  return ratio === null ? null : Math.round(ratio * 100);
}
