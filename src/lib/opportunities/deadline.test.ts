import { describe, expect, it } from "vitest";

import {
  canApply,
  deadlineState,
  displayStatus,
  isClosingSoon,
} from "@/lib/opportunities/deadline";

const NOW = new Date("2026-06-15T12:00:00.000Z");

function at(days: number, hour = 18): string {
  const date = new Date(NOW);
  date.setUTCDate(date.getUTCDate() + days);
  date.setUTCHours(hour - 5, 0, 0, 0);
  return date.toISOString();
}

describe("deadlineState", () => {
  it("reports a passed deadline", () => {
    expect(deadlineState(at(-1), NOW)).toEqual({ kind: "passed" });
  });

  it("treats later today as today rather than a fraction of a day", () => {
    expect(deadlineState(at(0, 23), NOW)).toEqual({ kind: "today" });
  });

  it("counts calendar days, so 02:00 tomorrow is tomorrow", () => {
    expect(deadlineState(at(1, 2), NOW)).toEqual({ kind: "tomorrow" });
  });

  it("marks the near window as soon", () => {
    expect(deadlineState(at(3), NOW)).toEqual({ kind: "soon", days: 3 });
  });

  it("returns a date for anything further out", () => {
    expect(deadlineState(at(10), NOW).kind).toBe("later");
  });

  it("does not produce NaN for an unparseable date", () => {
    const state = deadlineState("not-a-date", NOW);
    expect(state.kind).toBe("later");
    expect(Number.isNaN(state.kind === "later" ? state.days : 0)).toBe(false);
  });
});

describe("isClosingSoon", () => {
  it("covers today, tomorrow, and the three-day window", () => {
    expect(isClosingSoon(at(0, 20), NOW)).toBe(true);
    expect(isClosingSoon(at(1), NOW)).toBe(true);
    expect(isClosingSoon(at(3), NOW)).toBe(true);
  });

  it("excludes anything further out and anything past", () => {
    expect(isClosingSoon(at(4), NOW)).toBe(false);
    expect(isClosingSoon(at(-1), NOW)).toBe(false);
  });
});

describe("displayStatus", () => {
  it("closes an open opportunity whose deadline has passed", () => {
    expect(displayStatus({ status: "open", applicationDeadline: at(-2) }, NOW)).toBe(
      "closed",
    );
  });

  it("surfaces urgency for an imminent deadline", () => {
    expect(displayStatus({ status: "open", applicationDeadline: at(2) }, NOW)).toBe(
      "closingSoon",
    );
  });

  it("leaves a non-open status alone", () => {
    expect(displayStatus({ status: "full", applicationDeadline: at(9) }, NOW)).toBe(
      "full",
    );
    expect(displayStatus({ status: "closed", applicationDeadline: at(9) }, NOW)).toBe(
      "closed",
    );
  });
});

describe("canApply", () => {
  it("allows an open opportunity, including one closing soon", () => {
    expect(canApply({ status: "open", applicationDeadline: at(9) }, NOW)).toBe(true);
    expect(canApply({ status: "open", applicationDeadline: at(1) }, NOW)).toBe(true);
  });

  it("refuses past deadlines and full or closed opportunities", () => {
    expect(canApply({ status: "open", applicationDeadline: at(-1) }, NOW)).toBe(false);
    expect(canApply({ status: "full", applicationDeadline: at(9) }, NOW)).toBe(false);
    expect(canApply({ status: "closed", applicationDeadline: at(9) }, NOW)).toBe(false);
  });
});
