import { z } from "zod";

/**
 * The opportunity domain, as the frontend requires it.
 *
 * **Status: provisional.** There is no YVC backend yet — the marketing
 * repository's own docs record that nothing is implemented server-side. These
 * schemas therefore state what the UI needs, not what any API returns. When a
 * real contract exists, this file is the one place to reconcile, and every
 * mismatch surfaces as an `invalidResponse` at the boundary rather than as
 * `undefined` somewhere deep in a component.
 *
 * @see docs/api/API_CONTRACT.md
 */

/**
 * The 14 regions of Uzbekistan. Stable codes; display names come from the
 * translation catalogues so a region reads correctly in all three languages.
 */
export const REGIONS = [
  "andijan",
  "bukhara",
  "fergana",
  "jizzakh",
  "kashkadarya",
  "khorezm",
  "namangan",
  "navoiy",
  "samarkand",
  "sirdaryo",
  "surkhandarya",
  "tashkent-region",
  "tashkent-city",
  "karakalpakstan",
] as const;

export const regionSchema = z.enum(REGIONS);
export type Region = z.infer<typeof regionSchema>;

export const OPPORTUNITY_FORMATS = ["onsite", "remote", "hybrid"] as const;
export const opportunityFormatSchema = z.enum(OPPORTUNITY_FORMATS);
export type OpportunityFormat = z.infer<typeof opportunityFormatSchema>;

/**
 * Lifecycle as the backend reports it. `closingSoon` is *not* here on purpose:
 * it is a function of the deadline and the current time, so deriving it keeps
 * one definition instead of letting a stale server value disagree with the
 * clock. See `deriveStatus`.
 */
export const OPPORTUNITY_STATUSES = ["open", "closed", "full"] as const;
export const opportunityStatusSchema = z.enum(OPPORTUNITY_STATUSES);
export type OpportunityStatus = z.infer<typeof opportunityStatusSchema>;

export const organizationSummarySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  logoUrl: z.url().optional(),
  /** Whether YVC has verified this organiser. Never inferred client-side. */
  verified: z.boolean().default(false),
});

export type OrganizationSummary = z.infer<typeof organizationSummarySchema>;

/**
 * One opportunity-specific question. Answers to these are never carried over
 * from another application automatically (handoff §5).
 */
export const applicationQuestionSchema = z.object({
  id: z.string().min(1),
  prompt: z.string().min(1),
  helpText: z.string().optional(),
  type: z.enum(["short_text", "long_text", "single_select", "multi_select"]),
  required: z.boolean().default(true),
  /** Only rendered as a counter when the backend actually states a limit. */
  maxLength: z.number().int().positive().optional(),
  options: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
});

export type ApplicationQuestion = z.infer<typeof applicationQuestionSchema>;

/** The fields a list card needs. Kept separate so lists stay cheap. */
export const opportunitySummarySchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  organization: organizationSummarySchema,
  region: regionSchema,
  city: z.string().optional(),
  format: opportunityFormatSchema,
  status: opportunityStatusSchema,
  /** ISO 8601. Parsed to a Date only at the point of formatting. */
  startsAt: z.iso.datetime({ offset: true }),
  endsAt: z.iso.datetime({ offset: true }).optional(),
  applicationDeadline: z.iso.datetime({ offset: true }),
  imageUrl: z.url().optional(),
  capacity: z.number().int().positive().optional(),
  spotsRemaining: z.number().int().nonnegative().optional(),
});

export type OpportunitySummary = z.infer<typeof opportunitySummarySchema>;

export const opportunityDetailSchema = opportunitySummarySchema.extend({
  description: z.string().min(1),
  requirements: z.array(z.string()).default([]),
  locationName: z.string().optional(),
  questions: z.array(applicationQuestionSchema).default([]),
  /** Set when YVC sourced this rather than a partner submitting it. */
  sourcedByYvc: z.boolean().default(false),
});

export type OpportunityDetail = z.infer<typeof opportunityDetailSchema>;

export const opportunityListResponseSchema = z.object({
  items: z.array(opportunitySummarySchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});

export type OpportunityListResponse = z.infer<typeof opportunityListResponseSchema>;

/* -------------------------------------------------------------------------- */
/*  Filters                                                                    */
/* -------------------------------------------------------------------------- */

export const OPPORTUNITY_SORTS = ["deadline", "startDate", "newest"] as const;
export const opportunitySortSchema = z.enum(OPPORTUNITY_SORTS);
export type OpportunitySort = z.infer<typeof opportunitySortSchema>;

export const PAGE_SIZE = 12;

/**
 * The filter state that lives in the URL.
 *
 * It is a schema rather than a loose object because it crosses three
 * boundaries — URL, query key, and API request — and each of them needs the
 * same guarantees about which values are legal.
 */
export const opportunityFiltersSchema = z.object({
  q: z.string().trim().max(120).default(""),
  region: regionSchema.nullable().default(null),
  format: opportunityFormatSchema.nullable().default(null),
  openOnly: z.boolean().default(false),
  sort: opportunitySortSchema.default("deadline"),
  page: z.number().int().positive().default(1),
});

export type OpportunityFilters = z.infer<typeof opportunityFiltersSchema>;

export const DEFAULT_FILTERS: OpportunityFilters = {
  q: "",
  region: null,
  format: null,
  openOnly: false,
  sort: "deadline",
  page: 1,
};

/** How many filters the user has actually set, for the "N applied" badge. */
export function activeFilterCount(filters: OpportunityFilters): number {
  let count = 0;
  if (filters.q.trim()) count += 1;
  if (filters.region) count += 1;
  if (filters.format) count += 1;
  if (filters.openOnly) count += 1;
  return count;
}

export function hasActiveFilters(filters: OpportunityFilters): boolean {
  return activeFilterCount(filters) > 0;
}
