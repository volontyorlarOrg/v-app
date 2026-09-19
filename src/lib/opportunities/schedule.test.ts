import { createFormatter } from "next-intl";
import { describe, expect, it } from "vitest";

import { formats } from "@/i18n/formats";
import { EVENT_TIME_ZONE } from "@/lib/datetime";

import { eventSchedule, isSameEventDay, momentOf } from "./schedule";

const format = createFormatter({ locale: "en", timeZone: EVENT_TIME_ZONE, formats });

function plain(value: string): string {
  return value.replace(/\s/g, " ");
}

describe("event schedule", () => {
  it("keeps a one-day event to one date with a time range", () => {
    expect(
      plain(
        eventSchedule(
          { startsAt: "2026-10-10T04:00:00.000Z", endsAt: "2026-10-10T08:00:00.000Z" },
          format,
        ),
      ),
    ).toBe("October 10, 09:00 AM–01:00 PM");
  });

  it("names the end date and time of an event that runs over several days", () => {
    expect(
      plain(
        eventSchedule(
          { startsAt: "2026-10-10T04:00:00.000Z", endsAt: "2026-10-12T04:00:00.000Z" },
          format,
        ),
      ),
    ).toBe("October 10, 09:00 AM – October 12, 09:00 AM");
  });

  it("shows only the start when the event has no end", () => {
    expect(plain(eventSchedule({ startsAt: "2026-10-10T04:00:00.000Z" }, format))).toBe(
      "October 10, 09:00 AM",
    );
  });

  it("can lead with the weekday for the dashboard's next-up list", () => {
    expect(
      plain(
        eventSchedule(
          { startsAt: "2026-10-10T04:00:00.000Z", endsAt: "2026-10-10T08:00:00.000Z" },
          format,
          "weekday",
        ),
      ),
    ).toBe("Saturday, October 10, 09:00 AM–01:00 PM");
  });

  it("decides the day in Tashkent, so an event past local midnight spans two days", () => {
    expect(
      isSameEventDay(
        new Date("2026-10-10T18:00:00.000Z"),
        new Date("2026-10-10T20:00:00.000Z"),
      ),
    ).toBe(false);
    expect(
      isSameEventDay(
        new Date("2026-10-10T04:00:00.000Z"),
        new Date("2026-10-10T18:30:00.000Z"),
      ),
    ).toBe(true);
  });

  it("writes a single moment as a date and a time", () => {
    expect(plain(momentOf("2026-10-05T04:00:00.000Z", format))).toBe(
      "October 5, 09:00 AM",
    );
  });
});
