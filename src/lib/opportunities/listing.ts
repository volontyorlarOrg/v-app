import type { OpportunitySummary } from "./types";

export function groupOpportunities<T extends OpportunitySummary>(
  items: readonly T[],
  now: Date,
): { current: T[]; expired: T[] } {
  const current: T[] = [];
  const expired: T[] = [];

  for (const opportunity of items) {
    const isExpired =
      opportunity.status === "closed" ||
      new Date(opportunity.applicationDeadline).getTime() <= now.getTime();
    (isExpired ? expired : current).push(opportunity);
  }

  return { current, expired };
}
