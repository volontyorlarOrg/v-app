import { ArrowUpRight, Building2, CalendarDays, MapPin, Users } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { LoadErrorRows, type LoadErrorLabels } from "@/components/app/load-error";
import type { Loaded } from "@/lib/api/load.server";
import type { PastEventList } from "@/lib/api/schemas";
import { PAST_OPPORTUNITIES } from "@/lib/opportunities/archive";

function formatDate(format: ReturnType<typeof useFormatter>, value: string) {
  return format.dateTime(new Date(value), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function PastOpportunitiesArchive({
  events,
  errorLabels,
}: {
  events: Loaded<PastEventList>;
  errorLabels: LoadErrorLabels;
}) {
  const t = useTranslations("opportunities.archive");
  const format = useFormatter();

  return (
    <section
      aria-labelledby="past-opportunities-title"
      className="mt-8 border-t border-border pt-6"
    >
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h2
            id="past-opportunities-title"
            className="text-base font-semibold text-ink"
          >
            {t("title")}
          </h2>
          <p className="text-sm text-ink-muted">{t("description")}</p>
          <p className="mt-1 text-xs text-ink-muted">{t("illustrationsNote")}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
          <span className="figure text-xl text-ink">50+</span>
          <span className="text-sm text-ink-muted">{t("eventsOrganized")}</span>
          <a
            href="https://t.me/yvc_uz/276"
            target="_blank"
            rel="noopener noreferrer"
            className="-ml-1 inline-flex size-(--control-sm) items-center justify-center rounded-md text-primary hover:bg-surface-sunk"
            aria-label={t("countSource")}
          >
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </a>
        </div>
      </header>

      {events.status === "failed" ? (
        <LoadErrorRows
          failure={events.failure}
          labels={errorLabels}
          className="mt-4 rounded-lg border border-border bg-surface shadow-panel"
        />
      ) : events.data.items.length > 0 ? (
        <ul
          aria-label={t("recorded")}
          className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {events.data.items.map((event) => (
            <li key={event.id} className="flex min-w-0">
              <article className="flex w-full flex-col rounded-lg border border-border bg-surface p-4 shadow-panel">
                <span className="w-fit rounded-sm bg-surface-sunk px-1.5 py-0.5 text-xs font-medium text-ink-muted">
                  {t("pastEvent")}
                </span>

                <h3 className="mt-2 text-sm font-medium text-balance [overflow-wrap:anywhere] text-ink">
                  {event.title}
                </h3>

                <p className="mt-2 flex items-start gap-1.5 text-sm text-ink-muted">
                  <CalendarDays
                    aria-hidden="true"
                    className="mt-0.5 size-3.5 shrink-0"
                  />
                  <time dateTime={event.eventDate}>
                    {formatDate(format, event.eventDate)}
                  </time>
                </p>

                <p className="mt-1 flex items-start gap-1.5 text-sm text-ink-muted">
                  <Building2 aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                  <span className="[overflow-wrap:anywhere]">
                    {event.organization.name}
                  </span>
                </p>

                <p className="tabular mt-1 flex items-start gap-1.5 text-sm text-ink-muted">
                  <Users aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                  <span>
                    {t("took", {
                      count: event.volunteers,
                      hours: format.number(event.hours),
                    })}
                  </span>
                </p>
              </article>
            </li>
          ))}
        </ul>
      ) : null}

      <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {PAST_OPPORTUNITIES.map((item) => {
          const title = t(`items.${item.titleKey}`);

          return (
            <li key={item.id} className="flex min-w-0">
              <article className="flex w-full flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-panel">
                <div
                  className="past-opportunity-art"
                  data-scene={item.scene}
                  aria-hidden="true"
                >
                  <span className="absolute bottom-2 left-2 rounded-sm bg-surface px-1.5 py-0.5 text-xs font-medium text-ink-muted">
                    {t("illustration")}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted">
                    <span className="rounded-sm bg-surface-sunk px-1.5 py-0.5 font-medium">
                      {t("categories.eventTeam")}
                    </span>
                    <span>{t("pastEvent")}</span>
                  </div>

                  <h3 className="mt-2 text-sm font-medium text-balance text-ink">
                    {title}
                  </h3>

                  <p className="mt-2 flex items-start gap-1.5 text-sm text-ink-muted">
                    <CalendarDays
                      aria-hidden="true"
                      className="mt-0.5 size-3.5 shrink-0"
                    />
                    <span>
                      <time dateTime={item.startsAt}>
                        {formatDate(format, item.startsAt)}
                      </time>
                      <span aria-hidden="true"> – </span>
                      <time dateTime={item.endsAt}>
                        {formatDate(format, item.endsAt)}
                      </time>
                    </span>
                  </p>

                  <p className="mt-1 flex items-start gap-1.5 text-sm text-ink-muted">
                    <MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                    <span>{t(`locations.${item.locationKey}`)}</span>
                  </p>

                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto -mb-2 inline-flex min-h-(--control-sm) items-center gap-1 pt-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
                    aria-label={t("sourceFor", { title })}
                  >
                    {t("originalPost")}
                    <ArrowUpRight aria-hidden="true" className="size-3.5" />
                  </a>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
