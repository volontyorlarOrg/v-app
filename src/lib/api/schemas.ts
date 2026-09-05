import { z } from "zod";

import { APPLICATION_STATUSES } from "@/lib/applications/status";
import {
  OPPORTUNITY_FORMATS,
  OPPORTUNITY_STATUSES,
  QUESTION_TYPES,
  REGIONS,
} from "@/lib/opportunities/types";
import { ATTENDANCE_OUTCOMES } from "@/lib/record/levels";

function optional<T extends z.ZodTypeAny>(schema: T) {
  return schema.nullish().transform((value) => value ?? undefined);
}

const isoDate = z.string().min(1);

export const organizationSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  slug: z.string().default(""),
  logoUrl: optional(z.string()),
  verified: z.boolean().default(false),
});

export const opportunitySummarySchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string(),
  summary: z.string().default(""),
  organization: organizationSchema,
  region: z.enum(REGIONS),
  city: optional(z.string()),
  locationName: optional(z.string()),
  format: z.enum(OPPORTUNITY_FORMATS),
  status: z.enum(OPPORTUNITY_STATUSES),
  startsAt: isoDate,
  endsAt: optional(isoDate),
  applicationDeadline: isoDate,
  imageUrl: optional(z.string()),
  capacity: optional(z.number().int()),
  spotsRemaining: optional(z.number().int()),
});

const questionOptionSchema = z
  .object({ value: z.string(), label: z.string().optional() })
  .transform((option) => ({ value: option.value, label: option.label ?? option.value }));

export const applicationQuestionSchema = z.object({
  id: z.string().min(1),
  prompt: z.string(),
  helpText: optional(z.string()),
  type: z.enum(QUESTION_TYPES),
  required: z.boolean().default(false),
  maxLength: optional(z.number().int()),
  options: optional(z.array(questionOptionSchema)),
});

export const opportunityDetailSchema = opportunitySummarySchema
  .extend({
    description: z.string().default(""),
    requirements: z.array(z.string()).default([]),
    questions: z.array(applicationQuestionSchema).default([]),
    sourcedByYvc: z.boolean().default(false),
  })
  .transform(({ sourcedByYvc, ...opportunity }) => ({
    ...opportunity,
    sourcedByTeam: sourcedByYvc,
  }));

export const opportunityListSchema = z.object({
  items: z.array(opportunitySummarySchema),
  page: z.number().int().default(1),
  pageSize: z.number().int().default(0),
  total: z.number().int(),
});

export const applicationSummarySchema = z.object({
  id: z.string().min(1),
  status: z.enum(APPLICATION_STATUSES),
  opportunity: opportunitySummarySchema,
  createdAt: isoDate,
  updatedAt: isoDate,
  submittedAt: optional(isoDate),
  reviewedAt: optional(isoDate),
  withdrawnAt: optional(isoDate),
});

const answerValueSchema = z.unknown().transform((value): string | string[] => {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
    return value as string[];
  }
  return "";
});

export const applicationAnswerSchema = z.object({
  questionId: optional(z.string()),
  prompt: optional(z.string()),
  type: optional(z.enum(QUESTION_TYPES)),
  value: answerValueSchema,
});

export const profileSnapshotSchema = z.object({
  fullName: optional(z.string()),
  region: optional(z.string()),
  school: optional(z.string()),
  phone: optional(z.string()),
  telegram: optional(z.string()),
});

export const applicationDetailSchema = applicationSummarySchema.extend({
  answers: z.array(applicationAnswerSchema).default([]),
  profileSnapshot: optional(profileSnapshotSchema),
  reviewerNote: optional(z.string()),
});

export const applicationListSchema = z.object({
  items: z.array(applicationSummarySchema),
  total: z.number().int(),
});

export const savedListSchema = z.object({
  items: z.array(opportunitySummarySchema),
  total: z.number().int(),
});

export const savedItemSchema = z.object({
  opportunityId: z.string().min(1),
  saved: z.boolean().optional(),
  savedAt: z.string().optional(),
});

export const profileSchema = z.object({
  fullName: z.string().default(""),
  bio: z.string().default(""),
  school: z.string().default(""),
  gradeYear: z.string().default(""),
  region: z.enum(REGIONS).nullable().default(null),
  city: z.string().default(""),
  languages: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  phone: z.string().default(""),
  phoneVerified: z.boolean().default(false),
  telegram: z.string().default(""),
  links: z.array(z.string()).default([]),
  updatedAt: optional(z.string()),
});

export const recordSchema = z.object({
  counts: z.object({
    attended: z.number().int().nonnegative(),
    acceptedResolved: z.number().int().nonnegative(),
    acceptedUnconfirmed: z.number().int().nonnegative(),
    standoutReviews: z.boolean().default(false),
  }),
  hours: optional(z.number()),
  hoursVerified: z.boolean().default(true),
});

export const participationEntrySchema = z.object({
  id: z.string().min(1),
  opportunityTitle: z.string(),
  organization: z.string(),
  eventDate: isoDate,
  outcome: z.enum(ATTENDANCE_OUTCOMES),
  hours: optional(z.number()),
});

export const historySchema = z.object({
  items: z.array(participationEntrySchema),
  total: z.number().int(),
});

export const notificationSchema = z
  .object({
    id: z.string().min(1),
    kind: z.string().default(""),
    title: z.string(),
    body: z.string().default(""),
    readAt: optional(isoDate),
    createdAt: isoDate,
  })
  .transform((notification) => ({
    id: notification.id,
    kind: notification.kind,
    title: notification.title,
    body: notification.body,
    at: notification.createdAt,
    unread: notification.readAt === undefined,
  }));

export const notificationListSchema = z.object({
  items: z.array(notificationSchema),
  unread: z.number().int().default(0),
});

export const preferencesSchema = z.object({
  notifyTelegram: z.boolean(),
  notifyEmail: z.boolean(),
  remindDeadlines: z.boolean(),
  notifyDecisions: z.boolean(),
  profileToOrganisers: z.boolean(),
  levelPublic: z.boolean(),
});

export const meSchema = z.object({
  id: z.string().min(1),
  displayName: optional(z.string()),
  roles: z.array(z.string()).default([]),
  createdAt: isoDate,
  telegramIdentity: optional(
    z.object({
      username: optional(z.string()),
      linkedAt: optional(z.string()),
    }),
  ),
});

export const acknowledgementSchema = z.looseObject({});

export type Me = z.infer<typeof meSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Preferences = z.infer<typeof preferencesSchema>;
export type OpportunityList = z.infer<typeof opportunityListSchema>;
export type ApplicationList = z.infer<typeof applicationListSchema>;
export type SavedList = z.infer<typeof savedListSchema>;
export type NotificationList = z.infer<typeof notificationListSchema>;
export type History = z.infer<typeof historySchema>;
