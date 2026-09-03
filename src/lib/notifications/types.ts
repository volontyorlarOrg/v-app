import type { LocalizedText } from "@/lib/opportunities/types";

export const NOTIFICATION_KINDS = [
  "attendanceConfirmed",
  "applicationAccepted",
  "applicationUnderReview",
  "deadlineSoon",
  "newOpportunity",
] as const;

export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

export type Notification = {
  id: string;
  kind: NotificationKind;
  subject: LocalizedText;
  at: string;
  unread: boolean;
};
