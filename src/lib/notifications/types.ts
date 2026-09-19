export type Notification = {
  id: string;
  kind: string;
  title: string;
  body: string;
  data: Readonly<Record<string, unknown>> | null;
  at: string;
  unread: boolean;
};

export const MERGE_NOTIFICATION_KINDS = [
  "account.merge.requested",
  "account.merge.approved",
  "account.merge.rejected",
  "account.merge.cancelled",
  "account.merge.expired",
] as const;

export type MergeNotificationKind = (typeof MERGE_NOTIFICATION_KINDS)[number];

const MERGE_KIND_PREFIX = "account.merge";

export function isMergeNotificationKind(kind: string): boolean {
  return kind === MERGE_KIND_PREFIX || kind.startsWith(`${MERGE_KIND_PREFIX}.`);
}

export type MergeNotificationName =
  "requested" | "approved" | "rejected" | "cancelled" | "expired" | "other";

const MERGE_NOTIFICATION_NAMES: readonly MergeNotificationName[] = [
  "requested",
  "approved",
  "rejected",
  "cancelled",
  "expired",
];

export function mergeNotificationName(kind: string): MergeNotificationName | null {
  if (!isMergeNotificationKind(kind)) return null;

  const name = kind.slice(MERGE_KIND_PREFIX.length).replace(/^\./, "");
  return MERGE_NOTIFICATION_NAMES.find((candidate) => candidate === name) ?? "other";
}

export const ACTIVITY_NOTIFICATION_NAMES = [
  "submitted",
  "under_review",
  "accepted",
  "rejected",
  "closed",
  "attended",
  "excused",
  "cancelled",
] as const;

export type ActivityNotificationName = (typeof ACTIVITY_NOTIFICATION_NAMES)[number];

export type ActivityNotification = {
  name: ActivityNotificationName;
  applicationId: string | null;
};

const REVIEW_NAMES: readonly ActivityNotificationName[] = [
  "under_review",
  "accepted",
  "rejected",
  "closed",
];

const ATTENDANCE_NAMES: readonly ActivityNotificationName[] = [
  "attended",
  "excused",
  "cancelled",
];

function textOf(data: Notification["data"], key: string): string | null {
  const value = data?.[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function nameIn(
  names: readonly ActivityNotificationName[],
  value: string | null,
): ActivityNotificationName | null {
  return names.find((name) => name === value) ?? null;
}

export function activityNotification(
  kind: string,
  data: Notification["data"],
): ActivityNotification | null {
  const applicationId = textOf(data, "applicationId");

  if (kind === "application.submitted") return { name: "submitted", applicationId };

  if (kind === "application.reviewed") {
    const name = nameIn(REVIEW_NAMES, textOf(data, "status"));
    return name ? { name, applicationId } : null;
  }

  if (kind === "attendance.resolved") {
    const name = nameIn(ATTENDANCE_NAMES, textOf(data, "outcome"));
    return name ? { name, applicationId: null } : null;
  }

  return null;
}
