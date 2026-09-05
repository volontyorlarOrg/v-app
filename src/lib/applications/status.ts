import type { OpportunitySummary, QuestionType } from "@/lib/opportunities/types";

export const APPLICATION_STATUSES = [
  "draft",
  "submitted",
  "under_review",
  "accepted",
  "rejected",
  "withdrawn",
  "closed",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export type ApplicationSummary = {
  id: string;
  status: ApplicationStatus;
  opportunity: OpportunitySummary;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  reviewedAt?: string;
  withdrawnAt?: string;
};

export type AnswerValue = string | string[];

export type ApplicationAnswer = {
  questionId?: string;
  prompt?: string;
  type?: QuestionType;
  value: AnswerValue;
};

export type ProfileSnapshot = {
  fullName?: string;
  region?: string;
  school?: string;
  phone?: string;
  telegram?: string;
};

export type ApplicationDetail = ApplicationSummary & {
  answers: ApplicationAnswer[];
  profileSnapshot?: ProfileSnapshot;
  reviewerNote?: string;
};

export function decidedAt(
  application: Pick<ApplicationSummary, "status" | "reviewedAt" | "withdrawnAt" | "updatedAt">,
): string | undefined {
  switch (application.status) {
    case "withdrawn":
      return application.withdrawnAt ?? application.updatedAt;
    case "accepted":
    case "rejected":
      return application.reviewedAt ?? application.updatedAt;
    case "closed":
      return application.updatedAt;
    default:
      return undefined;
  }
}

const EDITABLE = new Set<ApplicationStatus>(["draft"]);
const WITHDRAWABLE = new Set<ApplicationStatus>([
  "submitted",
  "under_review",
  "accepted",
]);
const TERMINAL = new Set<ApplicationStatus>(["rejected", "withdrawn", "closed"]);

export function isEditable(status: ApplicationStatus): boolean {
  return EDITABLE.has(status);
}

export function isWithdrawable(status: ApplicationStatus): boolean {
  return WITHDRAWABLE.has(status);
}

export function isTerminal(status: ApplicationStatus): boolean {
  return TERMINAL.has(status);
}

export function isUpcomingCommitment(
  application: Pick<ApplicationSummary, "status" | "opportunity">,
  now: Date,
): boolean {
  return (
    application.status === "accepted" &&
    new Date(application.opportunity.startsAt).getTime() > now.getTime()
  );
}

export const APPLICATION_GROUPS = ["all", "drafts", "active", "decided"] as const;
export type ApplicationGroup = (typeof APPLICATION_GROUPS)[number];

export function isApplicationGroup(value: unknown): value is ApplicationGroup {
  return (
    typeof value === "string" &&
    (APPLICATION_GROUPS as readonly string[]).includes(value)
  );
}

export function applicationGroup(
  status: ApplicationStatus,
): Exclude<ApplicationGroup, "all"> {
  if (status === "draft") return "drafts";
  if (status === "submitted" || status === "under_review") return "active";
  return "decided";
}

export function inApplicationGroup(
  status: ApplicationStatus,
  group: ApplicationGroup,
): boolean {
  return group === "all" || applicationGroup(status) === group;
}

export const TIMELINE_STEPS = ["submitted", "under_review", "decided"] as const;
export type TimelineStep = (typeof TIMELINE_STEPS)[number];
export type TimelineState = "done" | "current" | "pending";

export type TimelineEntry = { step: TimelineStep; state: TimelineState; at?: string };

export function applicationTimeline(
  application: Pick<
    ApplicationSummary,
    "status" | "submittedAt" | "reviewedAt" | "withdrawnAt" | "updatedAt"
  >,
): TimelineEntry[] {
  const submitted: TimelineEntry = {
    step: "submitted",
    state: "done",
    at: application.submittedAt,
  };
  const reviewed: TimelineEntry = {
    step: "under_review",
    state: "done",
    at: application.reviewedAt,
  };
  const decided: TimelineEntry = {
    step: "decided",
    state: "done",
    at: decidedAt(application),
  };

  switch (application.status) {
    case "draft":
      return [
        { step: "submitted", state: "current" },
        { step: "under_review", state: "pending" },
        { step: "decided", state: "pending" },
      ];
    case "submitted":
      return [
        submitted,
        { step: "under_review", state: "current" },
        { step: "decided", state: "pending" },
      ];
    case "under_review":
      return [
        submitted,
        { step: "under_review", state: "current", at: application.reviewedAt },
        { step: "decided", state: "pending" },
      ];
    case "accepted":
    case "rejected":
    case "withdrawn":
    case "closed":
      return [submitted, reviewed, decided];
  }
}
