import { describe, expect, it } from "vitest";
import { calendarDaysBetween, isValidDate } from "./datetime";

/**
 * Timezone stability.
 *
 * The bug these tests were written for: `date-fns`'s calendar-day helpers work
 * in the *process* timezone, so "closes today" flipped to "closes tomorrow"
 * depending on where the app was deployed — and could differ between the
 * server render and the client hydration of the same page.
 */
describe("calendarDaysBetween", () => {
  // 2026-06-15 17:00 Tashkent.
  const now = new Date("2026-06-15T12:00:00.000Z");

  it("is zero for two instants on the same Tashkent day", () => {
    // 23:00 Tashkent the same evening — six hours later, still today.
    expect(calendarDaysBetween(now, new Date("2026-06-15T18:00:00.000Z"))).toBe(0);
  });

  it("is one across a Tashkent midnight, however small the gap", () => {
    // 19:05 UTC is 00:05 Tashkent the next day.
    expect(calendarDaysBetween(now, new Date("2026-06-15T19:05:00.000Z"))).toBe(1);
  });

  it("does not shift when the instant crosses UTC midnight but not Tashkent's", () => {
    // 22:00 UTC on the 15th is 03:00 Tashkent on the 16th: one day, not zero.
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
    // The same two instants must give the same answer everywhere. This is the
    // property that makes a server-rendered deadline badge safe to hydrate.
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
