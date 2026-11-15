import type { OpportunitySummary } from "./types";

export function groupOpportunities<T extends OpportunitySummary>(
  items: readonly T[],
  now: Date,
): { current: T[]; past: T[] } {
  const current: T[] = [];
  const past: T[] = [];

  for (const opportunity of items) {
    const isPast =
      opportunity.status === "closed" ||
      new Date(opportunity.applicationDeadline).getTime() <= now.getTime();
    (isPast ? past : current).push(opportunity);
  }

  return { current, past };
}
