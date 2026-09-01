import { z } from "zod";
import { opportunitySummarySchema } from "@/features/opportunities/schemas";

/**
 * Application domain.
 *
 * **Status: provisional** — no backend contract exists yet. The state list
 * below is the handoff's suggested set, encoded in one place so that
 * reconciling it with a real backend enum is a single edit rather than a
 * search-and-replace across components.
 *
 * @see docs/api/API_CONTRACT.md, docs/features/applications.md
 */

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

/** Statuses whose answers the volunteer can still change. */
const EDITABLE_STATUSES = new Set<ApplicationStatus>(["draft"]);

/** Statuses the volunteer can still withdraw from. */
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

/**
 * Whether a status is a final outcome. Used to decide whether to keep polling
 * or to stop asking — not to colour anything, since a "final" status can be
 * good (accepted) or not (rejected).
 */
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
  /**
   * A snapshot of the profile fields as they were at submission.
   *
   * Referencing the live profile instead would rewrite history: a volunteer
   * who changes school in March would appear to have applied in January with
   * their new one. Reviewers need to see what they were actually sent.
   */
  profileSnapshot: z
    .object({
      fullName: z.string(),
      region: z.string().optional(),
      school: z.string().optional(),
      phone: z.string().optional(),
      telegram: z.string().optional(),
    })
    .optional(),
  /** Set by a reviewer. Shown to the volunteer only when the backend says so. */
  reviewerNote: z.string().optional(),
});

export type ApplicationDetail = z.infer<typeof applicationDetailSchema>;

export const applicationListResponseSchema = z.object({
  items: z.array(applicationSummarySchema),
  total: z.number().int().nonnegative(),
});

/* -------------------------------------------------------------------------- */
/*  Form input                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Builds the submit-time validation schema for one opportunity's questions.
 *
 * Generated from the backend's question list rather than hand-written, so a
 * question added server-side is validated without a frontend change — and a
 * `maxLength` counter can never disagree with the rule that rejects the answer.
 *
 * Error messages are **keys** into the `validation` namespace, not sentences.
 * The field component translates them, which is what lets the same schema
 * serve all three locales.
 */
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

/**
 * Draft validation, used for autosave.
 *
 * Deliberately permissive: a draft is saved *because* it is incomplete. Running
 * the submit schema on autosave would mean a half-typed answer produces a
 * validation error every few seconds while the volunteer is still writing.
 */
export const draftAnswersSchema = z.record(
  z.string(),
  z.union([z.string(), z.array(z.string())]),
);

export type DraftAnswers = z.infer<typeof draftAnswersSchema>;
