import { BadgeCheck } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";

import { DeadlineText } from "@/components/dashboard/opportunity-status";
import type { Locale } from "@/i18n/routing";
import { localized, type OpportunitySummary } from "@/lib/opportunities/types";

export function OpportunityFacts({
  opportunity,
  now,
}: {
  opportunity: OpportunitySummary;
  now: Date;
}) {
  const t = useTranslations("opportunities");
  const format = useFormatter();
  const locale = useLocale() as Locale;

  const starts = new Date(opportunity.startsAt);
  const ends = opportunity.endsAt ? new Date(opportunity.endsAt) : null;
  const sameDay = ends
    ? format.dateTime(starts, "day") === format.dateTime(ends, "day")
    : true;
  const remote = opportunity.format === "remote";
  const place = remote
    ? t(`format.${opportunity.format}`)
    : [
        opportunity.locationName ? localized(opportunity.locationName, locale) : null,
        opportunity.city ? localized(opportunity.city, locale) : null,
        t(`regions.${opportunity.region}`),
      ]
        .filter(Boolean)
        .join(", ");

  const facts = [
    {
      key: "organiser",
      label: t("detail.organiser"),
      value: (
        <span className="inline-flex items-center gap-1.5">
          {localized(opportunity.organization.name, locale)}
          {opportunity.organization.verified ? (
            <BadgeCheck aria-label={t("verified")} className="size-4 text-primary" />
          ) : null}
        </span>
      ),
    },
    {
      key: "date",
      label: t("detail.date"),
      value: (
        <span className="tabular">
          {format.dateTime(starts, "date")}, {format.dateTime(starts, "time")}
          {ends
            ? sameDay
              ? `–${format.dateTime(ends, "time")}`
              : ` – ${format.dateTime(ends, "date")}`
            : null}
        </span>
      ),
    },
    { key: "location", label: t("detail.location"), value: place },
    {
      key: "deadline",
      label: t("detail.deadline"),
      value: (
        <span className="tabular">
          <DeadlineText deadline={opportunity.applicationDeadline} now={now} /> ·{" "}
          {format.dateTime(new Date(opportunity.applicationDeadline), "date")}
        </span>
      ),
    },
    {
      key: "format",
      label: t("detail.format"),
      value: t(`format.${opportunity.format}`),
    },
    ...(opportunity.capacity !== undefined
      ? [
          {
            key: "capacity",
            label: t("detail.capacity"),
            value: (
              <span className="tabular">
                {opportunity.spotsRemaining !== undefined
                  ? t("detail.spotsOf", {
                      spots: opportunity.spotsRemaining,
                      capacity: opportunity.capacity,
                    })
                  : opportunity.capacity}
              </span>
            ),
          },
        ]
      : []),
  ];

  return (
    <dl className="divide-y divide-border">
      {facts.map((fact) => (
        <div key={fact.key} className="grid gap-1 py-3 first:pt-0 last:pb-0">
          <dt className="text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase">
            {fact.label}
          </dt>
          <dd className="text-sm font-semibold text-ink">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}
