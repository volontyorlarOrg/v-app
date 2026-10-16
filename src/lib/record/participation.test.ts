import { describe, expect, it } from "vitest";

import type { ParticipationEntry } from "@/lib/record/levels";
import {
  RECENT_PARTICIPATION_SHOWN,
  participationHref,
  participationRole,
  participationStatus,
  recentParticipation,
} from "@/lib/record/participation";

const NOW = new Date("2026-10-16T09:00:00Z");

function entry(overrides: Partial<ParticipationEntry> = {}): ParticipationEntry {
  return {
    id: "attendance-1",
    source: "attendance",
    opportunityTitle: "Book Donation Drive",
    kind: "volunteering",
    organization: "Chilonzor Reading Corners",
    eventDate: "2026-09-28T05:00:00Z",
    eventEndsAt: "2026-09-28T09:00:00Z",
    outcome: "attended",
    hours: 4,
    xpAwarded: 40,
    applicationId: "app-1",
    ...overrides,
  };
}

describe("what a participation row says", () => {
  it("calls an attended event verified", () => {
    expect(participationStatus(entry(), NOW)).toBe("verified");
  });

  it("waits for verification once an unconfirmed event has ended", () => {
    expect(participationStatus(entry({ outcome: "awaiting_confirmation" }), NOW)).toBe(
      "awaiting",
    );
  });

  it("calls an unconfirmed event upcoming until it ends, not awaiting", () => {
    const ahead = entry({
      outcome: "awaiting_confirmation",
      eventDate: "2026-10-20T05:00:00Z",
      eventEndsAt: "2026-10-20T09:00:00Z",
    });
    expect(participationStatus(ahead, NOW)).toBe("upcoming");
    const running = entry({
      outcome: "awaiting_confirmation",
      eventDate: "2026-10-16T05:00:00Z",
      eventEndsAt: "2026-10-16T12:00:00Z",
    });
    expect(participationStatus(running, NOW)).toBe("upcoming");
  });

  it("falls back to the start when the backend sends no end", () => {
    const started = entry({
      outcome: "awaiting_confirmation",
      eventDate: "2026-10-16T05:00:00Z",
      eventEndsAt: undefined,
    });
    expect(participationStatus(started, NOW)).toBe("awaiting");
  });

  it("names the other outcomes as they are", () => {
    for (const outcome of ["excused", "cancelled", "no_show"] as const) {
      expect(participationStatus(entry({ outcome }), NOW)).toBe(outcome);
    }
  });

  it("verifies a counted past event and keeps an uncounted one as history only", () => {
    const manual = entry({ source: "manual", applicationId: undefined });
    expect(participationStatus({ ...manual, countsTowardProgress: true }, NOW)).toBe(
      "verified",
    );
    expect(participationStatus({ ...manual, countsTowardProgress: false }, NOW)).toBe(
      "historyOnly",
    );
  });
});

describe("the role beside a verified result", () => {
  it("is the kind for volunteering", () => {
    expect(participationRole(entry())).toEqual({ type: "kind", kind: "volunteering" });
  });

  it("is the placement for a competition, taking part when none was given", () => {
    expect(
      participationRole(entry({ kind: "competition", placement: "contributor" })),
    ).toEqual({ type: "placement", placement: "contributor" });
    expect(participationRole(entry({ kind: "competition" }))).toEqual({
      type: "placement",
      placement: "attendee",
    });
  });

  it("is a past event for an entry added by the team", () => {
    expect(participationRole(entry({ source: "manual" }))).toEqual({
      type: "pastEvent",
    });
  });
});

describe("recent participation", () => {
  it("keeps the backend's order, leaves out what has not happened yet and stops at four", () => {
    const entries = [
      entry({
        id: "ahead",
        outcome: "awaiting_confirmation",
        eventDate: "2026-10-30T05:00:00Z",
        eventEndsAt: "2026-10-30T09:00:00Z",
      }),
      entry({ id: "a", outcome: "awaiting_confirmation" }),
      entry({ id: "b" }),
      entry({ id: "c", outcome: "no_show" }),
      entry({ id: "d", source: "manual" }),
      entry({ id: "e" }),
    ];
    expect(recentParticipation(entries, NOW).map((item) => item.id)).toEqual([
      "a",
      "b",
      "c",
      "d",
    ]);
    expect(RECENT_PARTICIPATION_SHOWN).toBe(4);
  });
});

describe("where a row leads", () => {
  it("opens the application behind an attendance row", () => {
    expect(participationHref(entry())).toBe("/applications/app-1");
  });

  it("leads nowhere for a past event or a row without its application", () => {
    expect(participationHref(entry({ source: "manual" }))).toBeNull();
    expect(participationHref(entry({ applicationId: undefined }))).toBeNull();
  });
});
