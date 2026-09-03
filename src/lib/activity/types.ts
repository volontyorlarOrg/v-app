import type { LocalizedText } from "@/lib/opportunities/types";

export const ACTIVITY_KINDS = [
  "attendanceConfirmed",
  "applicationAccepted",
  "applicationSubmitted",
  "opportunitySaved",
  "levelReached",
] as const;

export type ActivityKind = (typeof ACTIVITY_KINDS)[number];

export type ActivityEntry = {
  id: string;
  kind: ActivityKind;
  at: string;
  subject: LocalizedText;
};

export function isPersonalAchievement(kind: ActivityKind): boolean {
  return (
    kind === "attendanceConfirmed" ||
    kind === "applicationAccepted" ||
    kind === "levelReached"
  );
}
