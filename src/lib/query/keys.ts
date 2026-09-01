import type { OpportunityFilters } from "@/features/opportunities/schemas";

/**
 * The one query-key factory. Raw inline key arrays are not allowed anywhere.
 *
 * Two rules make invalidation predictable:
 *   - Every filtered/paginated key nests under an unfiltered ancestor, so a
 *     mutation can invalidate *all* variants without enumerating them.
 *   - Keys are built from the same object the request uses, so a key can never
 *     drift from the query it identifies.
 *
 * @see docs/architecture/RENDERING_AND_STATE.md
 */
export const queryKeys = {
  opportunities: {
    all: ["opportunities"] as const,
    /** Every list variant, for broad invalidation. */
    lists: () => [...queryKeys.opportunities.all, "list"] as const,
    list: (filters: OpportunityFilters) =>
      [...queryKeys.opportunities.lists(), filters] as const,
    detail: (slug: string) =>
      [...queryKeys.opportunities.all, "detail", slug] as const,
  },

  saved: {
    all: ["saved"] as const,
    list: () => [...queryKeys.saved.all, "list"] as const,
    /** Membership of one opportunity, for the card's save toggle. */
    contains: (opportunityId: string) =>
      [...queryKeys.saved.all, "contains", opportunityId] as const,
  },

  applications: {
    all: ["applications"] as const,
    lists: () => [...queryKeys.applications.all, "list"] as const,
    list: (status: string | null) =>
      [...queryKeys.applications.lists(), { status }] as const,
    detail: (applicationId: string) =>
      [...queryKeys.applications.all, "detail", applicationId] as const,
    /** The volunteer's application to a given opportunity, if any. */
    forOpportunity: (opportunityId: string) =>
      [...queryKeys.applications.all, "for-opportunity", opportunityId] as const,
  },

  profile: {
    all: ["profile"] as const,
    me: () => [...queryKeys.profile.all, "me"] as const,
    completion: () => [...queryKeys.profile.all, "completion"] as const,
  },

  record: {
    all: ["record"] as const,
    me: () => [...queryKeys.record.all, "me"] as const,
    history: () => [...queryKeys.record.all, "history"] as const,
  },
} as const;
