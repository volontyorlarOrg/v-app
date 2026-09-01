import { describe, expect, it } from "vitest";
import { calendarDaysBetween, isValidDate } from "./datetime";

describe("calendarDaysBetween", () => {
  const now = new Date("2026-06-15T12:00:00.000Z");

  it("is zero for two instants on the same Tashkent day", () => {
    expect(calendarDaysBetween(now, new Date("2026-06-15T18:00:00.000Z"))).toBe(0);
  });

  it("is one across a Tashkent midnight, however small the gap", () => {
    expect(calendarDaysBetween(now, new Date("2026-06-15T19:05:00.000Z"))).toBe(1);
  });

  it("does not shift when the instant crosses UTC midnight but not Tashkent's", () => {
    expect(calendarDaysBetween(now, new Date("2026-06-15T22:00:00.000Z"))).toBe(1);
  });

  it("counts backwards for a past instant", () => {
    expect(calendarDaysBetween(now, new Date("2026-06-13T12:00:00.000Z"))).toBe(-2);
  });

  it("counts whole days across a month boundary", () => {
    expect(
      calendarDaysBetween(
        new Date("2026-06-29T12:00:00.000Z"),
        new Date("2026-07-02T12:00:00.000Z"),
      ),
    ).toBe(3);
  });

  it("is unaffected by the process timezone", () => {
    const a = new Date("2026-06-15T12:00:00.000Z");
    const b = new Date("2026-06-17T12:00:00.000Z");
    expect(calendarDaysBetween(a, b)).toBe(2);
  });
});

describe("isValidDate", () => {
  it("accepts a real date and rejects an unparseable one", () => {
    expect(isValidDate(new Date("2026-06-15T12:00:00.000Z"))).toBe(true);
    expect(isValidDate(new Date("nonsense"))).toBe(false);
  });
});
