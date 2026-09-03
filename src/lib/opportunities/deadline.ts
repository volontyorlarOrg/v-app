import { calendarDaysBetween, isValidDate } from "@/lib/datetime";

import type { OpportunityStatus, OpportunitySummary } from "./types";

export const CLOSING_SOON_DAYS = 3;

export type DeadlineState =
  | { kind: "passed" }
  | { kind: "today" }
  | { kind: "tomorrow" }
  | { kind: "soon"; days: number }
  | { kind: "later"; days: number; date: Date };

export function deadlineState(
  deadlineIso: string,
  now: Date = new Date(),
): DeadlineState {
  const deadline = new Date(deadlineIso);

  if (!isValidDate(deadline)) {
    return { kind: "later", days: Number.POSITIVE_INFINITY, date: deadline };
  }

  if (now.getTime() > deadline.getTime()) return { kind: "passed" };

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

export type DisplayStatus = OpportunityStatus | "closingSoon";

export function displayStatus(
  opportunity: Pick<OpportunitySummary, "status" | "applicationDeadline">,
  now: Date = new Date(),
): DisplayStatus {
  if (opportunity.status !== "open") return opportunity.status;

  const state = deadlineState(opportunity.applicationDeadline, now);
  if (state.kind === "passed") return "closed";

  return isClosingSoon(opportunity.applicationDeadline, now) ? "closingSoon" : "open";
}

export function canApply(
  opportunity: Pick<OpportunitySummary, "status" | "applicationDeadline">,
  now: Date = new Date(),
): boolean {
  const status = displayStatus(opportunity, now);
  return status === "open" || status === "closingSoon";
}
