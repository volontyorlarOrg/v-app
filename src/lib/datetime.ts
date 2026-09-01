export const EVENT_TIME_ZONE = "Asia/Tashkent";

const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: EVENT_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function calendarDay(date: Date): Date {
  return new Date(`${dayFormatter.format(date)}T00:00:00.000Z`);
}

const MS_PER_DAY = 86_400_000;

export function calendarDaysBetween(from: Date, to: Date): number {
  return Math.round(
    (calendarDay(to).getTime() - calendarDay(from).getTime()) / MS_PER_DAY,
  );
}

export function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}
