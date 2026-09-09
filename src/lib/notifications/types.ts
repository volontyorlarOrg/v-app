export type Notification = {
  id: string;
  kind: string;
  title: string;
  body: string;
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
