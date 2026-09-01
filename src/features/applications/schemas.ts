import { z } from "zod";
import { opportunitySummarySchema } from "@/features/opportunities/schemas";

export const APPLICATION_STATUSES = [
  "draft",
  "submitted",
  "under_review",
  "accepted",
  "rejected",
  "withdrawn",
  "closed",
] as const;

export const applicationStatusSchema = z.enum(APPLICATION_STATUSES);
export type ApplicationStatus = z.infer<typeof applicationStatusSchema>;

const EDITABLE_STATUSES = new Set<ApplicationStatus>(["draft"]);

const WITHDRAWABLE_STATUSES = new Set<ApplicationStatus>([
  "submitted",
  "under_review",
  "accepted",
]);

export function isEditable(status: ApplicationStatus): boolean {
  return EDITABLE_STATUSES.has(status);
}

export function isWithdrawable(status: ApplicationStatus): boolean {
  return WITHDRAWABLE_STATUSES.has(status);
}

export function isTerminal(status: ApplicationStatus): boolean {
  return status === "rejected" || status === "withdrawn" || status === "closed";
}

export const applicationAnswerSchema = z.object({
  questionId: z.string().min(1),
  value: z.union([z.string(), z.array(z.string())]),
});

export type ApplicationAnswer = z.infer<typeof applicationAnswerSchema>;

export const applicationSummarySchema = z.object({
  id: z.string().min(1),
  status: applicationStatusSchema,
  opportunity: opportunitySummarySchema,
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
  submittedAt: z.iso.datetime({ offset: true }).optional(),
});

export type ApplicationSummary = z.infer<typeof applicationSummarySchema>;

export const applicationDetailSchema = applicationSummarySchema.extend({
  answers: z.array(applicationAnswerSchema).default([]),

  profileSnapshot: z
    .object({
      fullName: z.string(),
      region: z.string().optional(),
      school: z.string().optional(),
      phone: z.string().optional(),
      telegram: z.string().optional(),
    })
    .optional(),

  reviewerNote: z.string().optional(),
});

export type ApplicationDetail = z.infer<typeof applicationDetailSchema>;

export const applicationListResponseSchema = z.object({
  items: z.array(applicationSummarySchema),
  total: z.number().int().nonnegative(),
});

export function buildAnswersSchema(
  questions: readonly {
    id: string;
    type: "short_text" | "long_text" | "single_select" | "multi_select";
    required: boolean;
    maxLength?: number | undefined;
  }[],
) {
  const shape: Record<string, z.ZodType> = {};

  for (const question of questions) {
    if (question.type === "multi_select") {
      const base = z.array(z.string());
      shape[question.id] = question.required
        ? base.min(1, { message: "selectAtLeastOne" })
        : base;
      continue;
    }

    let field = z.string();

    if (question.required) {
      field = field.trim().min(1, { message: "required" });
    }

    if (question.maxLength !== undefined) {
      field = field.max(question.maxLength, { message: "tooLong" });
    }

    shape[question.id] = field;
  }

  return z.object(shape);
}

export const draftAnswersSchema = z.record(
  z.string(),
  z.union([z.string(), z.array(z.string())]),
);

export type DraftAnswers = z.infer<typeof draftAnswersSchema>;
