import { describe, expect, it } from "vitest";

import {
  applicationsByOpportunity,
  cardAction,
  type CardApplication,
} from "@/lib/opportunities/card";
import type { ApplicationStatus } from "@/lib/applications/status";

const NOW = new Date("2026-06-15T12:00:00.000Z");

const open = {
  slug: "riverbank-clean-up",
  status: "open" as const,
  applicationDeadline: "2026-06-30T18:00:00.000Z",
};

const closed = { ...open, applicationDeadline: "2026-06-01T18:00:00.000Z" };

function application(status: ApplicationStatus, updatedAt = "2026-06-10T10:00:00.000Z") {
  return { id: `application-${status}`, status, updatedAt } satisfies CardApplication;
}

describe("cardAction", () => {
  it("invites an application when the volunteer has none and the vacancy is open", () => {
    expect(cardAction(open, null, NOW)).toEqual({
      kind: "apply",
      href: "/opportunities/riverbank-clean-up",
    });
  });

  it("only shows the vacancy once applications have closed", () => {
    expect(cardAction(closed, null, NOW).kind).toBe("view");
  });

  it("resumes a draft rather than starting another one", () => {
    expect(cardAction(open, application("draft"), NOW)).toEqual({
      kind: "continue",
      href: "/applications/application-draft",
    });
  });

  it("tracks an application the organiser already has", () => {
    for (const status of ["submitted", "under_review", "accepted"] as const) {
      expect(cardAction(open, application(status), NOW).kind).toBe("track");
    }
  });

  it("still tracks a decided application, because the page is its receipt", () => {
    for (const status of ["rejected", "withdrawn", "closed"] as const) {
      expect(cardAction(open, application(status), NOW).kind).toBe("track");
    }
  });

  it("never routes a card to anything that would submit on its own", () => {
    const actions = [
      cardAction(open, null, NOW),
      cardAction(open, application("draft"), NOW),
      cardAction(open, application("accepted"), NOW),
      cardAction(closed, null, NOW),
    ];
    for (const action of actions) {
      expect(action.href).toMatch(/^\/(opportunities|applications)\//);
    }
  });
});

describe("applicationsByOpportunity", () => {
  it("indexes one application per opportunity", () => {
    const index = applicationsByOpportunity([
      { ...application("draft"), opportunity: { id: "a" } },
      { ...application("submitted"), opportunity: { id: "b" } },
    ]);
    expect(index.get("a")?.status).toBe("draft");
    expect(index.get("b")?.status).toBe("submitted");
  });

  it("prefers the open application when an old one was withdrawn", () => {
    const index = applicationsByOpportunity([
      {
        ...application("withdrawn", "2026-06-12T10:00:00.000Z"),
        opportunity: { id: "a" },
      },
      {
        ...application("submitted", "2026-06-11T10:00:00.000Z"),
        opportunity: { id: "a" },
      },
    ]);
    expect(index.get("a")?.status).toBe("submitted");
  });

  it("prefers the newest when both are finished", () => {
    const index = applicationsByOpportunity([
      {
        ...application("withdrawn", "2026-06-11T10:00:00.000Z"),
        opportunity: { id: "a" },
      },
      {
        ...application("rejected", "2026-06-12T10:00:00.000Z"),
        opportunity: { id: "a" },
      },
    ]);
    expect(index.get("a")?.status).toBe("rejected");
  });
});
