import { describe, expect, it } from "vitest";

import { calendarDaysBetween, isValidDate, tashkentInstant } from "@/lib/datetime";

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
});

describe("tashkentInstant", () => {
  const now = new Date("2026-06-15T12:00:00.000Z");

  it("places a wall-clock time on a Tashkent calendar day", () => {
    expect(tashkentInstant(now, 0, 9)).toBe("2026-06-15T04:00:00.000Z");
    expect(tashkentInstant(now, 2, 18, 30)).toBe("2026-06-17T13:30:00.000Z");
  });

  it("keeps the calendar day even when the source instant is late in Tashkent", () => {
    const lateEvening = new Date("2026-06-15T20:00:00.000Z");
    expect(tashkentInstant(lateEvening, 0, 9)).toBe("2026-06-16T04:00:00.000Z");
  });

  it("accepts negative offsets for the past", () => {
    expect(calendarDaysBetween(now, new Date(tashkentInstant(now, -3, 10)))).toBe(-3);
  });
});

describe("isValidDate", () => {
  it("accepts a real date and rejects an unparseable one", () => {
    expect(isValidDate(new Date("2026-06-15T12:00:00.000Z"))).toBe(true);
    expect(isValidDate(new Date("nonsense"))).toBe(false);
  });
});
