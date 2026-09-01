/**
 * Time handling for a product whose deadlines are real.
 *
 * Every displayed date and every "closes in N days" calculation resolves in
 * **one fixed timezone**, not the viewer's and not the server's.
 *
 * Why that matters concretely: `differenceInCalendarDays` and friends work in
 * whatever timezone the running process happens to be in. A deadline at
 * 23:00 Tashkent time is "today" for a server in Tashkent and "tomorrow" for
 * one deployed in UTC — and worse, a server-rendered badge could disagree with
 * the client that hydrates it. Pinning the zone makes the answer a property of
 * the event rather than of the infrastructure.
 *
 * Asia/Tashkent because that is where the events happen and where the
 * organisers close their lists. A volunteer opening a link from abroad sees
 * the local closing time, which is the one that binds them.
 */
export const EVENT_TIME_ZONE = "Asia/Tashkent";

/**
 * `Intl` formatters are expensive to construct and are reused constantly here,
 * so the one we need is built once.
 */
const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: EVENT_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * The calendar date in the event timezone, as a UTC-midnight `Date`.
 *
 * `en-CA` is used purely because it formats as `YYYY-MM-DD`, which parses back
 * unambiguously — the locale is an implementation detail, not a display choice.
 */
function calendarDay(date: Date): Date {
  return new Date(`${dayFormatter.format(date)}T00:00:00.000Z`);
}

const MS_PER_DAY = 86_400_000;

/**
 * Whole calendar days from `from` to `to`, counted in the event timezone.
 *
 * Positive when `to` is later. Both endpoints collapse to their calendar date
 * first, so 23:00 today to 01:00 tomorrow is 1 day, not 0.
 */
export function calendarDaysBetween(from: Date, to: Date): number {
  return Math.round(
    (calendarDay(to).getTime() - calendarDay(from).getTime()) / MS_PER_DAY,
  );
}

/** Whether `date` is a real, parseable instant. */
export function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}
