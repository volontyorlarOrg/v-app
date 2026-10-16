import type { ParticipationEntry, Placement } from "@/lib/record/levels";
import { applicationHref } from "@/lib/routing/routes";

export const RECENT_PARTICIPATION_SHOWN = 4;

export type ParticipationStatus =
  | "verified"
  | "historyOnly"
  | "awaiting"
  | "upcoming"
  | "excused"
  | "cancelled"
  | "no_show";

export type ParticipationRole =
  | { type: "kind"; kind: ParticipationEntry["kind"] }
  | { type: "placement"; placement: Placement }
  | { type: "pastEvent" };

export function hasEnded(entry: ParticipationEntry, now: Date): boolean {
  return new Date(entry.eventEndsAt ?? entry.eventDate).getTime() <= now.getTime();
}

export function participationStatus(
  entry: ParticipationEntry,
  now: Date,
): ParticipationStatus {
  if (entry.source === "manual") {
    return entry.countsTowardProgress === false ? "historyOnly" : "verified";
  }
  if (entry.outcome === "attended") return "verified";
  if (entry.outcome === "awaiting_confirmation") {
    return hasEnded(entry, now) ? "awaiting" : "upcoming";
  }
  return entry.outcome;
}

export function participationRole(entry: ParticipationEntry): ParticipationRole {
  if (entry.source === "manual") return { type: "pastEvent" };
  if (entry.kind === "competition") {
    return { type: "placement", placement: entry.placement ?? "attendee" };
  }
  return { type: "kind", kind: entry.kind };
}

export function isPending(status: ParticipationStatus): boolean {
  return status === "awaiting" || status === "upcoming";
}

export function recentParticipation(
  entries: readonly ParticipationEntry[],
  now: Date,
  shown: number = RECENT_PARTICIPATION_SHOWN,
): ParticipationEntry[] {
  return entries
    .filter((entry) => participationStatus(entry, now) !== "upcoming")
    .slice(0, shown);
}

export function participationHref(entry: ParticipationEntry): string | null {
  return entry.source === "attendance" && entry.applicationId
    ? applicationHref(entry.applicationId)
    : null;
}
