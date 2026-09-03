import { BadgeCheck } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";

import {
  DeadlineText,
  OpportunityStatusChip,
} from "@/components/dashboard/opportunity-status";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { localized, type OpportunitySummary } from "@/lib/opportunities/types";
import { opportunityHref } from "@/lib/routing/routes";

export function OpportunityRows({
  opportunities,
  now,
  emptyLabel,
}: {
  opportunities: readonly OpportunitySummary[];
  now: Date;
  emptyLabel: string;
}) {
  const t = useTranslations("opportunities");
  const format = useFormatter();
  const locale = useLocale() as Locale;

  if (opportunities.length === 0) {
    return (
      <p className="px-5 py-6 text-sm leading-relaxed text-ink-muted">{emptyLabel}</p>
    );
  }

  return (
    <ul>
      {opportunities.map((opportunity) => {
        const place =
          opportunity.format === "remote"
            ? t(`format.${opportunity.format}`)
            : opportunity.city
              ? localized(opportunity.city, locale)
              : t(`regions.${opportunity.region}`);

        return (
          <li
            key={opportunity.id}
            className="border-t border-border px-5 py-4 first:border-t-0"
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink-muted">
              <OpportunityStatusChip opportunity={opportunity} now={now} />
              <DeadlineText deadline={opportunity.applicationDeadline} now={now} />
            </div>
            <h3 className="mt-2 text-base font-semibold text-balance">
              <Link
                href={opportunityHref(opportunity.slug)}
                className="text-ink hover:text-primary-ink"
              >
                {localized(opportunity.title, locale)}
              </Link>
            </h3>
            <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-sm text-ink-muted">
              <span>{localized(opportunity.organization.name, locale)}</span>
              {opportunity.organization.verified ? (
                <BadgeCheck
                  aria-label={t("verified")}
                  className="size-3.5 text-primary"
                />
              ) : null}
              <span aria-hidden="true">·</span>
              <span>{place}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={opportunity.startsAt} className="tabular">
                {format.dateTime(new Date(opportunity.startsAt), "day")}
              </time>
            </p>
          </li>
        );
      })}
    </ul>
  );
}
