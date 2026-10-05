import { useFormatter, useTranslations } from "next-intl";

export type ProfilePastEvent = {
  id: string;
  title: string;
  organization: string;
  eventDate: string;
  hours: number;
  xpAwarded: number;
  countsTowardProgress: boolean;
};

export function PastEventsSection({ events }: { events: readonly ProfilePastEvent[] }) {
  const t = useTranslations("profile.pastEvents");
  const format = useFormatter();

  if (events.length === 0) return null;

  return (
    <section
      aria-labelledby="profile-past-events"
      className="border-t border-border px-5 py-6 sm:px-8"
    >
      <h2 id="profile-past-events" className="text-section text-ink">
        {t("title")}
      </h2>
      <ul className="mt-4 divide-y divide-border">
        {events.map((event) => (
          <li
            key={event.id}
            className="flex flex-wrap items-baseline gap-x-5 gap-y-1 py-3 first:pt-0 last:pb-0"
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ink">{event.title}</p>
              <p className="text-sm text-ink-muted">
                {event.organization} ·{" "}
                <time dateTime={event.eventDate}>
                  {format.dateTime(
                    new Date(`${event.eventDate.slice(0, 10)}T00:00:00Z`),
                    "day",
                  )}
                </time>
              </p>
            </div>
            <p className="tabular text-sm text-ink">
              {format.number(event.hours)} {t("hours")}
              {event.countsTowardProgress
                ? ` · +${format.number(event.xpAwarded)} XP`
                : ""}
            </p>
            <p className="w-full text-xs text-ink-muted">
              {t("adminAdded")} ·{" "}
              {event.countsTowardProgress ? t("counted") : t("notCounted")}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
