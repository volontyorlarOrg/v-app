export const EVENT_TIME_ZONE = "Asia/Tashkent";

export const TASHKENT_UTC_OFFSET_HOURS = 5;

export const MS_PER_DAY = 86_400_000;

const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: EVENT_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function calendarDay(date: Date): Date {
  return new Date(`${dayFormatter.format(date)}T00:00:00.000Z`);
}

export function calendarDaysBetween(from: Date, to: Date): number {
  return Math.round(
    (calendarDay(to).getTime() - calendarDay(from).getTime()) / MS_PER_DAY,
  );
}

export function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}

export function tashkentInstant(
  from: Date,
  daysAhead: number,
  hour: number,
  minute = 0,
): string {
  const day = calendarDay(from).getTime() + daysAhead * MS_PER_DAY;
  const offset = (hour - TASHKENT_UTC_OFFSET_HOURS) * 3_600_000 + minute * 60_000;
  return new Date(day + offset).toISOString();
}
