import { calendarDay } from "@/lib/datetime";

export type ScheduleFormatter = {
  dateTime(value: Date, format: "date" | "weekday" | "time"): string;
};

export type ScheduleSubject = {
  startsAt: string;
  endsAt?: string | undefined;
};

export function isSameEventDay(starts: Date, ends: Date): boolean {
  return calendarDay(starts).getTime() === calendarDay(ends).getTime();
}

export function momentOf(value: string, format: ScheduleFormatter): string {
  const at = new Date(value);
  return `${format.dateTime(at, "date")}, ${format.dateTime(at, "time")}`;
}

export function eventSchedule(
  event: ScheduleSubject,
  format: ScheduleFormatter,
  lead: "date" | "weekday" = "date",
): string {
  const starts = new Date(event.startsAt);
  const opening = `${format.dateTime(starts, lead)}, ${format.dateTime(starts, "time")}`;
  if (!event.endsAt) return opening;

  const ends = new Date(event.endsAt);
  return isSameEventDay(starts, ends)
    ? `${opening}–${format.dateTime(ends, "time")}`
    : `${opening} – ${momentOf(event.endsAt, format)}`;
}
