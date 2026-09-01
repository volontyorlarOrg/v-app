import { z } from "zod";

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

export const OPPORTUNITY_STATUSES = ["open", "closed", "full"] as const;
export const opportunityStatusSchema = z.enum(OPPORTUNITY_STATUSES);
export type OpportunityStatus = z.infer<typeof opportunityStatusSchema>;

export const organizationSummarySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  logoUrl: z.url().optional(),

  verified: z.boolean().default(false),
});

export type OrganizationSummary = z.infer<typeof organizationSummarySchema>;

export const applicationQuestionSchema = z.object({
  id: z.string().min(1),
  prompt: z.string().min(1),
  helpText: z.string().optional(),
  type: z.enum(["short_text", "long_text", "single_select", "multi_select"]),
  required: z.boolean().default(true),

  maxLength: z.number().int().positive().optional(),
  options: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
});

export type ApplicationQuestion = z.infer<typeof applicationQuestionSchema>;

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

export const OPPORTUNITY_SORTS = ["deadline", "startDate", "newest"] as const;
export const opportunitySortSchema = z.enum(OPPORTUNITY_SORTS);
export type OpportunitySort = z.infer<typeof opportunitySortSchema>;

export const PAGE_SIZE = 12;

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
