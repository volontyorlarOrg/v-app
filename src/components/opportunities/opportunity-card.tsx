import { BadgeCheck, CalendarDays, MapPin, Monitor, Users } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";

import {
  DeadlineText,
  OpportunityStatusChip,
} from "@/components/dashboard/opportunity-status";
import { SaveButton } from "@/components/opportunities/save-button";
import { buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { localized, type OpportunitySummary } from "@/lib/opportunities/types";
import { opportunityHref } from "@/lib/routing/routes";

export function OpportunityCard({
  opportunity,
  saved,
  now,
}: {
  opportunity: OpportunitySummary;
  saved: boolean;
  now: Date;
}) {
  const t = useTranslations("opportunities");
  const format = useFormatter();
  const locale = useLocale() as Locale;

  const remote = opportunity.format === "remote";
  const place = remote
    ? t(`format.${opportunity.format}`)
    : opportunity.city
      ? localized(opportunity.city, locale)
      : t(`regions.${opportunity.region}`);

  return (
    <article className="flex w-full flex-col rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink-muted">
        <OpportunityStatusChip opportunity={opportunity} now={now} />
        <DeadlineText deadline={opportunity.applicationDeadline} now={now} />
      </div>

      <h3 className="mt-3 text-title font-semibold text-balance">
        <Link
          href={opportunityHref(opportunity.slug)}
          className="text-ink hover:text-primary-ink"
        >
          {localized(opportunity.title, locale)}
        </Link>
      </h3>

      <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 text-sm text-ink-muted">
        <span>{localized(opportunity.organization.name, locale)}</span>
        {opportunity.organization.verified ? (
          <BadgeCheck aria-label={t("verified")} className="size-3.5 text-primary" />
        ) : null}
      </p>

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-ink-muted">
        <li className="inline-flex items-center gap-1.5">
          {remote ? (
            <Monitor aria-hidden="true" className="size-3.5" />
          ) : (
            <MapPin aria-hidden="true" className="size-3.5" />
          )}
          {place}
        </li>
        <li className="inline-flex items-center gap-1.5">
          <CalendarDays aria-hidden="true" className="size-3.5" />
          <time dateTime={opportunity.startsAt} className="tabular">
            {format.dateTime(new Date(opportunity.startsAt), "day")}
          </time>
        </li>
        {opportunity.spotsRemaining !== undefined && opportunity.spotsRemaining > 0 ? (
          <li className="inline-flex items-center gap-1.5">
            <Users aria-hidden="true" className="size-3.5" />
            {t("spotsLeft", { count: opportunity.spotsRemaining })}
          </li>
        ) : null}
      </ul>

      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <SaveButton
          saved={saved}
          saveLabel={t("card.save")}
          savedLabel={t("card.saved")}
          className="-ml-4"
        />
        <Link
          href={opportunityHref(opportunity.slug)}
          className={buttonClass({ variant: "outline", size: "sm" })}
        >
          {t("card.view")}
        </Link>
      </div>
    </article>
  );
}
