import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { PAST_OPPORTUNITIES } from "@/lib/opportunities/archive";

function formatDate(format: ReturnType<typeof useFormatter>, value: string) {
  return format.dateTime(new Date(value), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function PastOpportunitiesArchive() {
  const t = useTranslations("opportunities.archive");
  const format = useFormatter();

  return (
    <section aria-labelledby="past-opportunities-title" className="mt-12">
      <header className="flex flex-col gap-5 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h2
            id="past-opportunities-title"
            className="text-title font-semibold text-ink"
          >
            {t("title")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            {t("description")}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-ink-muted">
            {t("illustrationsNote")}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3 self-start rounded-xl border border-border bg-surface px-4 py-3 sm:self-auto">
          <span className="font-serif text-3xl leading-none text-primary-ink">50+</span>
          <span className="max-w-24 text-sm leading-snug text-ink-muted">
            {t("eventsOrganized")}
          </span>
          <a
            href="https://t.me/yvc_uz/276"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex size-10 items-center justify-center rounded-md text-primary-ink hover:bg-surface-soft"
            aria-label={t("countSource")}
          >
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </a>
        </div>
      </header>

      <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {PAST_OPPORTUNITIES.map((item) => {
          const title = t(`items.${item.titleKey}`);

          return (
            <li key={item.id} className="flex min-w-0">
              <article className="panel-surface flex w-full flex-col overflow-hidden rounded-xl border border-border bg-surface">
                <div
                  className="past-opportunity-art"
                  data-scene={item.scene}
                  aria-hidden="true"
                >
                  <span className="absolute bottom-3 left-3 rounded-full bg-surface/90 px-2.5 py-1 text-xs font-medium text-ink-muted backdrop-blur-sm">
                    {t("illustration")}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-ink-muted">
                    <span className="rounded-full bg-surface-sunk px-2.5 py-1 font-medium">
                      {t("categories.eventTeam")}
                    </span>
                    <span>{t("pastEvent")}</span>
                  </div>

                  <h3 className="mt-3 text-base leading-snug font-semibold text-balance text-ink">
                    {title}
                  </h3>

                  <p className="mt-3 flex items-start gap-2 text-sm text-ink-muted">
                    <CalendarDays
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0"
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

                  <p className="mt-2 flex items-start gap-2 text-sm text-ink-muted">
                    <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                    <span>{t(`locations.${item.locationKey}`)}</span>
                  </p>

                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex min-h-11 items-center gap-1.5 border-t border-border pt-3 text-sm font-semibold text-primary-ink hover:underline"
                    aria-label={t("sourceFor", { title })}
                  >
                    {t("originalPost")}
                    <ArrowUpRight aria-hidden="true" className="size-4" />
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
