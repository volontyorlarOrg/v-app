import { useFormatter, useTranslations } from "next-intl";

import { DeadlineText } from "@/components/dashboard/opportunity-status";
import { deadlineState } from "@/lib/opportunities/deadline";
import { eventSchedule, momentOf } from "@/lib/opportunities/schedule";
import type { OpportunitySummary } from "@/lib/opportunities/types";

export function OpportunityFacts({
  opportunity,
  now,
}: {
  opportunity: OpportunitySummary;
  now: Date;
}) {
  const t = useTranslations("opportunities");
  const format = useFormatter();

  const place =
    opportunity.format === "remote"
      ? (opportunity.locationName ?? t(`format.${opportunity.format}`))
      : [
          opportunity.locationName ? opportunity.locationName : null,
          opportunity.city ? opportunity.city : null,
          t(`regions.${opportunity.region}`),
        ]
          .filter(Boolean)
          .join(", ");
  const deadlineIsNear =
    deadlineState(opportunity.applicationDeadline, now).kind !== "later";

  const facts = [
    {
      key: "date",
      label: t("detail.date"),
      value: <span className="tabular">{eventSchedule(opportunity, format)}</span>,
    },
    { key: "location", label: t("detail.location"), value: place },
    {
      key: "deadline",
      label: t("detail.deadline"),
      value: (
        <span className="tabular">
          {deadlineIsNear ? (
            <>
              <DeadlineText deadline={opportunity.applicationDeadline} now={now} />
              {" · "}
            </>
          ) : null}
          {momentOf(opportunity.applicationDeadline, format)}
        </span>
      ),
    },
    {
      key: "format",
      label: t("detail.format"),
      value: t(`format.${opportunity.format}`),
    },
    ...(opportunity.estimatedTotalHours !== undefined
      ? [
          {
            key: "estimatedTotalHours",
            label: t("detail.estimatedTotalHours"),
            value: t("estimatedHours", {
              hours: opportunity.estimatedTotalHours,
            }),
          },
        ]
      : []),
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
