import { isTerminal, type ApplicationStatus } from "@/lib/applications/status";
import { canApply } from "@/lib/opportunities/deadline";
import type { OpportunitySummary } from "@/lib/opportunities/types";
import { applicationHref, opportunityHref } from "@/lib/routing/routes";

export const CARD_ACTIONS = ["apply", "continue", "track", "view"] as const;
export type CardActionKind = (typeof CARD_ACTIONS)[number];

export type CardApplication = {
  id: string;
  status: ApplicationStatus;
  updatedAt: string;
};

export type CardAction = { kind: CardActionKind; href: string };

export function cardAction(
  opportunity: Pick<OpportunitySummary, "slug" | "status" | "applicationDeadline">,
  application: CardApplication | null,
  now: Date,
): CardAction {
  if (application) {
    return {
      kind: application.status === "draft" ? "continue" : "track",
      href: applicationHref(application.id),
    };
  }

  return {
    kind: canApply(opportunity, now) ? "apply" : "view",
    href: opportunityHref(opportunity.slug),
  };
}

export function applicationsByOpportunity(
  applications: readonly (CardApplication & { opportunity: { id: string } })[],
): Map<string, CardApplication> {
  const index = new Map<string, CardApplication>();

  for (const application of applications) {
    const key = application.opportunity.id;
    const current = index.get(key);
    if (!current || prefers(application, current)) {
      index.set(key, {
        id: application.id,
        status: application.status,
        updatedAt: application.updatedAt,
      });
    }
  }

  return index;
}

function prefers(candidate: CardApplication, current: CardApplication): boolean {
  const candidateOpen = !isTerminal(candidate.status);
  const currentOpen = !isTerminal(current.status);
  if (candidateOpen !== currentOpen) return candidateOpen;
  return Date.parse(candidate.updatedAt) > Date.parse(current.updatedAt);
}
