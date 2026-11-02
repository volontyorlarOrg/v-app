import { useFormatter, useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { DeadlineText } from "@/components/dashboard/opportunity-status";
import { deadlineState } from "@/lib/opportunities/deadline";
import { eventSchedule, momentOf } from "@/lib/opportunities/schedule";
import type { OpportunitySummary, ScheduleDay } from "@/lib/opportunities/types";

export type OpportunityFactKey =
  | "date"
  | "dailyTime"
  | "location"
  | "deadline"
  | "format"
  | "acceptance"
  | "estimatedTotalHours"
  | "capacity";

export function OpportunityFacts({
  opportunity,
  now,
  omit = [],
}: {
  opportunity: OpportunitySummary & {
    schedule?: readonly ScheduleDay[] | undefined;
    allDaysRequired?: boolean;
  };
  now: Date;
  omit?: readonly OpportunityFactKey[];
}) {
  const t = useTranslations("opportunities");
  const format = useFormatter();

  const placeParts = [
    opportunity.locationName,
    opportunity.city,
    t(`regions.${opportunity.region}`),
  ].filter((part): part is string => Boolean(part?.trim()));
  const place =
    opportunity.format === "remote"
      ? (opportunity.locationName ?? t(`format.${opportunity.format}`))
      : placeParts
          .filter(
            (part, index) =>
              placeParts.findIndex(
                (candidate) =>
                  candidate.localeCompare(part, undefined, { sensitivity: "base" }) ===
                  0,
              ) === index,
          )
          .join(", ");
  const deadlineIsNear =
    deadlineState(opportunity.applicationDeadline, now).kind !== "later";
  const formatLabel = t(`format.${opportunity.format}`);

  const days = opportunity.schedule ?? [];
  const first = days[0];
  const sameTimes = days.every(
    (day) => day.startTime === first?.startTime && day.endTime === first?.endTime,
  );
  const dailyTime = first ? (
    <span className="tabular">
      {sameTimes
        ? days.length > 1
          ? t("detail.eachDay", { time: `${first.startTime}–${first.endTime}` })
          : `${first.startTime}–${first.endTime}`
        : t("detail.timesVary")}
      {days.length > 1 ? (
        <span className="mt-0.5 block font-normal text-ink-muted">
          {opportunity.allDaysRequired === false
            ? t("detail.someDays")
            : t("detail.allDays", { count: days.length })}
        </span>
      ) : null}
    </span>
  ) : null;

  const facts: { key: OpportunityFactKey; label: string; value: ReactNode }[] = [
    {
      key: "date",
      label: t("detail.date"),
      value: <span className="tabular">{eventSchedule(opportunity, format)}</span>,
    },
    ...(dailyTime
      ? [{ key: "dailyTime" as const, label: t("detail.dailyTime"), value: dailyTime }]
      : []),
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
    ...(place === formatLabel
      ? []
      : [{ key: "format" as const, label: t("detail.format"), value: formatLabel }]),
    {
      key: "acceptance",
      label: t("detail.acceptance"),
      value: t(`detail.acceptanceMode.${opportunity.acceptanceMode}`),
    },
    ...(opportunity.estimatedTotalHours !== undefined
      ? [
          {
            key: "estimatedTotalHours" as const,
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
            key: "capacity" as const,
            label: t(
              opportunity.kind === "competition"
                ? "detail.competitionCapacity"
                : "detail.capacity",
            ),
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
      {facts
        .filter((fact) => !omit.includes(fact.key))
        .map((fact) => (
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
