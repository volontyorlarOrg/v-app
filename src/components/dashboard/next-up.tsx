import { useFormatter, useTranslations } from "next-intl";

import { EmptyState } from "@/components/app/empty-state";
import { buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { ApplicationSummary } from "@/lib/applications/status";
import { eventSchedule } from "@/lib/opportunities/schedule";
import type { OpportunitySummary } from "@/lib/opportunities/types";
import { navHref, opportunityHref } from "@/lib/routing/routes";

export function placeOf(
  opportunity: OpportunitySummary,
  t: (key: string) => string,
): string {
  if (opportunity.format === "remote") return t(`format.${opportunity.format}`);
  const named = opportunity.locationName ?? opportunity.city;
  return named ? named : t(`regions.${opportunity.region}`);
}

export function NextUp({
  commitments,
}: {
  commitments: readonly ApplicationSummary[];
}) {
  const t = useTranslations("dashboard.nextUp");
  const opportunities = useTranslations("opportunities");
  const format = useFormatter();

  if (commitments.length === 0) {
    return (
      <EmptyState
        body={t("empty")}
        action={
          <Link
            href={navHref("opportunities")}
            className={buttonClass({ variant: "outline", size: "sm" })}
          >
            {t("cta")}
          </Link>
        }
      />
    );
  }

  return (
    <ol>
      {commitments.map(({ id, opportunity }) => {
        const starts = new Date(opportunity.startsAt);

        return (
          <li
            key={id}
            className="grid grid-cols-[3rem_1fr] gap-x-3 border-t border-border px-5 py-3 first:border-t-0"
          >
            <div className="self-start rounded-md bg-surface-soft py-1 text-center">
              <time
                dateTime={opportunity.startsAt}
                className="figure block text-xl text-primary"
              >
                {format.dateTime(starts, { day: "numeric" })}
              </time>
              <span className="block text-xs text-primary">
                {format.dateTime(starts, { month: "short" })}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-balance">
                <Link
                  href={opportunityHref(opportunity.slug)}
                  className="text-ink hover:text-primary"
                >
                  {opportunity.title}
                </Link>
              </h3>
              <p className="text-sm text-ink-muted">
                {opportunity.organization.name} · {placeOf(opportunity, opportunities)}
              </p>
              <p className="tabular text-sm text-ink-muted">
                {eventSchedule(opportunity, format, "weekday")}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
