import { isAfter, parseISO } from "date-fns";
import { calendarDaysBetween, isValidDate } from "@/lib/datetime";
import type { OpportunityStatus, OpportunitySummary } from "./schemas";

/**
 * Deadline and status derivation.
 *
 * Pure functions, no React, no formatting — so the rule "when is an
 * opportunity closing soon" has exactly one definition that a unit test can
 * pin down, instead of being re-implemented in each component that shows a
 * badge.
 */

/** Below this many days remaining, a deadline is urgent enough to call out. */
export const CLOSING_SOON_DAYS = 3;

export type DeadlineState =
  | { kind: "passed" }
  | { kind: "today" }
  | { kind: "tomorrow" }
  | { kind: "soon"; days: number }
  | { kind: "later"; days: number; date: Date };

/**
 * Days are compared as *calendar* days in the event timezone, not as 24-hour
 * spans and not in the server's local zone: a deadline at 23:00 tonight is
 * "today", not "in 0.9 days", and it is "today" regardless of where the
 * process rendering it happens to run. See `lib/datetime.ts`.
 */
export function deadlineState(
  deadlineIso: string,
  now: Date = new Date(),
): DeadlineState {
  const deadline = parseISO(deadlineIso);

  if (!isValidDate(deadline)) {
    // An unparseable date must not render as "NaN days left". Treat it as
    // uninformative and let the caller fall back to the raw status.
    return { kind: "later", days: Number.POSITIVE_INFINITY, date: deadline };
  }

  if (isAfter(now, deadline)) return { kind: "passed" };

  const days = calendarDaysBetween(now, deadline);

  if (days <= 0) return { kind: "today" };
  if (days === 1) return { kind: "tomorrow" };
  if (days <= CLOSING_SOON_DAYS) return { kind: "soon", days };

  return { kind: "later", days, date: deadline };
}

export function isClosingSoon(deadlineIso: string, now: Date = new Date()): boolean {
  const state = deadlineState(deadlineIso, now);
  return state.kind === "today" || state.kind === "tomorrow" || state.kind === "soon";
}

/**
 * The status to display, which can differ from the stored one.
 *
 * The backend's `open` is a fact about the record; whether the deadline has
 * actually passed is a fact about the clock. A listing that says "Open" three
 * days after its deadline is worse than useless — a volunteer writes an essay
 * for nothing — so the clock wins here.
 */
export type DisplayStatus = OpportunityStatus | "closingSoon";

export function displayStatus(
  opportunity: Pick<OpportunitySummary, "status" | "applicationDeadline">,
  now: Date = new Date(),
): DisplayStatus {
  if (opportunity.status !== "open") return opportunity.status;

  const state = deadlineState(opportunity.applicationDeadline, now);
  if (state.kind === "passed") return "closed";

  return isClosingSoon(opportunity.applicationDeadline, now)
    ? "closingSoon"
    : "open";
}

/** Whether an apply CTA should be actionable. */
export function canApply(
  opportunity: Pick<OpportunitySummary, "status" | "applicationDeadline">,
  now: Date = new Date(),
): boolean {
  const status = displayStatus(opportunity, now);
  return status === "open" || status === "closingSoon";
}
