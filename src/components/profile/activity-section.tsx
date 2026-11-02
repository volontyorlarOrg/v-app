import { useFormatter, useTranslations } from "next-intl";

import type { Placement } from "@/lib/record/levels";

export type ProfileActivityEntry = {
  id: string;
  source: "attendance" | "manual";
  kind: "volunteering" | "competition";
  title: string;
  organization: string;
  eventDate: string;
  hours: number | null;
  placement: Placement | null;
  xpAwarded: number;
  countsTowardProgress: boolean;
};

const LEAD = 6;

function eventDay(value: string): Date {
  return new Date(value.length > 10 ? value : `${value}T00:00:00Z`);
}

function ActivityList({ entries }: { entries: readonly ProfileActivityEntry[] }) {
  const t = useTranslations("profile.activity");
  const record = useTranslations("record.history");
  const format = useFormatter();

  return (
    <ul className="divide-y divide-border">
      {entries.map((entry) => {
        const credited = entry.source === "attendance" || entry.countsTowardProgress;
        const facts = [
          entry.kind === "competition" && entry.placement
            ? record(`placements.${entry.placement}`)
            : null,
          entry.hours === null ? null : `${format.number(entry.hours)} ${t("hours")}`,
          credited && entry.xpAwarded > 0
            ? `+${format.number(entry.xpAwarded)} XP`
            : null,
        ].filter((fact): fact is string => fact !== null);

        return (
          <li
            key={`${entry.source}-${entry.id}`}
            className="flex flex-wrap items-baseline gap-x-5 gap-y-1 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold [overflow-wrap:anywhere] text-ink">
                {entry.title}
              </p>
              <p className="text-sm text-ink-muted">
                {entry.organization} ·{" "}
                <time dateTime={entry.eventDate}>
                  {format.dateTime(eventDay(entry.eventDate), "dayYear")}
                </time>
                {credited ? null : ` · ${t("notCounted")}`}
              </p>
            </div>
            {facts.length > 0 ? (
              <p className="tabular text-sm text-ink">{facts.join(" · ")}</p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export function ActivitySection({
  entries,
  own = false,
}: {
  entries: readonly ProfileActivityEntry[];
  own?: boolean;
}) {
  const t = useTranslations("profile.activity");

  if (entries.length === 0 && !own) return null;

  const lead = entries.slice(0, LEAD);
  const rest = entries.slice(LEAD);

  return (
    <section
      id="activity"
      aria-labelledby="profile-activity"
      className="scroll-mt-20 border-t border-border px-5 py-6 sm:px-8"
    >
      <h2 id="profile-activity" className="text-section text-ink">
        {own ? t("mine") : t("title")}
      </h2>
      {entries.length === 0 ? (
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t("empty")}</p>
      ) : (
        <div className="mt-1">
          <ActivityList entries={lead} />
          {rest.length > 0 ? (
            <details className="group border-t border-border">
              <summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold text-primary-ink underline-offset-4 group-open:hidden hover:underline">
                {t("more", { count: entries.length })}
              </summary>
              <ActivityList entries={rest} />
            </details>
          ) : null}
        </div>
      )}
    </section>
  );
}
