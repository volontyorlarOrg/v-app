import { z } from "zod";

import {
  CONNECTION_PROVIDERS,
  MERGE_REQUEST_DIRECTIONS,
  MERGE_REQUEST_STATUSES,
} from "@/lib/account/types";
import {
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_PATTERN,
  USERNAME_SOURCES,
} from "@/lib/account/username";
import { APPLICATION_STATUSES } from "@/lib/applications/status";
import { issuedSessionSchema } from "@/lib/auth/session";
import { LEADERBOARD_PAGE_SIZE } from "@/lib/leaderboard/pagination";
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

const usernameField = z
  .string()
  .min(USERNAME_MIN_LENGTH)
  .max(USERNAME_MAX_LENGTH)
  .regex(USERNAME_PATTERN);

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
  .transform((option) => ({
    value: option.value,
    label: option.label ?? option.value,
  }));

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

export const leaderboardEntrySchema = z.object({
  rank: z.number().int().positive(),
  username: usernameField,
  displayName: optional(z.string()),
  xp: z.number().int().nonnegative(),
});

export const leaderboardSchema = z.object({
  items: z.array(leaderboardEntrySchema),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(LEADERBOARD_PAGE_SIZE),
  total: z.number().int().nonnegative(),
  viewer: optional(leaderboardEntrySchema),
});

export const authMethodsSchema = z.object({
  telegram: z.boolean(),
  google: z.boolean(),
  password: z.boolean(),
});

export type AuthMethods = z.infer<typeof authMethodsSchema>;

const telegramIdentitySchema = z.object({
  username: optional(z.string()),
  linkedAt: optional(z.string()),
});

export const meSchema = z
  .object({
    id: z.string().min(1),
    displayName: optional(z.string()),
    username: optional(usernameField),
    usernameSource: optional(z.enum(USERNAME_SOURCES)),
    roles: z.array(z.string()).default([]),
    createdAt: isoDate,
    email: optional(z.string()),
    emailVerified: z.boolean().default(false),
    telegramIdentity: optional(telegramIdentitySchema),
    authMethods: optional(authMethodsSchema),
  })
  .transform((me) => ({
    ...me,
    authMethods: me.authMethods ?? {
      telegram: me.telegramIdentity !== undefined,
      google: false,
      password: false,
    },
  }));

export const connectedAccountSchema = z.object({
  id: z.string().min(1),
  authMethods: authMethodsSchema,
});

export const mergeCounterpartySchema = z.object({
  displayName: optional(z.string()),
  authMethods: authMethodsSchema,
});

export const mergeRequestSchema = z.object({
  id: z.string().min(1),
  status: z.enum(MERGE_REQUEST_STATUSES),
  direction: z.enum(MERGE_REQUEST_DIRECTIONS),
  requestedVia: z.enum(CONNECTION_PROVIDERS),
  createdAt: isoDate,
  expiresAt: isoDate,
  decidedAt: optional(isoDate),
  completedAt: optional(isoDate),
  counterparty: mergeCounterpartySchema,
});

export const connectionOutcomeSchema = z.discriminatedUnion("outcome", [
  z.object({ outcome: z.literal("linked"), account: connectedAccountSchema }),
  z.object({ outcome: z.literal("alreadyLinked"), account: connectedAccountSchema }),
  z.object({
    outcome: z.literal("approvalRequired"),
    mergeRequest: mergeRequestSchema,
  }),
]);

export const mergeRequestListSchema = z.object({
  incoming: z.array(mergeRequestSchema),
  outgoing: z.array(mergeRequestSchema),
});

export const mergeApprovalSchema = z.object({
  outcome: z.literal("merged"),
  request: mergeRequestSchema,
  session: issuedSessionSchema,
});

export const mergeResolutionSchema = z.object({ request: mergeRequestSchema });

export const acknowledgementSchema = z.looseObject({});

export type Me = z.infer<typeof meSchema>;
export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;
export type Leaderboard = z.infer<typeof leaderboardSchema>;
export type ConnectedAccount = z.infer<typeof connectedAccountSchema>;
export type MergeRequest = z.infer<typeof mergeRequestSchema>;
export type MergeRequestList = z.infer<typeof mergeRequestListSchema>;
export type ConnectionOutcome = z.infer<typeof connectionOutcomeSchema>;
export type MergeApproval = z.infer<typeof mergeApprovalSchema>;
export type MergeCounterparty = z.infer<typeof mergeCounterpartySchema>;
export type Profile = z.infer<typeof profileSchema>;
export type OpportunityList = z.infer<typeof opportunityListSchema>;
export type ApplicationList = z.infer<typeof applicationListSchema>;
export type SavedList = z.infer<typeof savedListSchema>;
export type NotificationList = z.infer<typeof notificationListSchema>;
export type History = z.infer<typeof historySchema>;
