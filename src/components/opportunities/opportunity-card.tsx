import { BadgeCheck, CalendarDays, Clock3, MapPin, Monitor, Users } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import {
  DeadlineText,
  OpportunityStatusChip,
} from "@/components/dashboard/opportunity-status";
import { ApplicationStatusChip } from "@/components/dashboard/application-status";
import { SaveButton } from "@/components/opportunities/save-button";
import { buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { ApplicationStatus } from "@/lib/applications/status";
import type { OpportunitySummary } from "@/lib/opportunities/types";
import { applicationHref, opportunityHref } from "@/lib/routing/routes";

export function OpportunityCard({
  opportunity,
  saved,
  now,
  application,
  showSave = true,
}: {
  opportunity: OpportunitySummary;
  saved: boolean;
  now: Date;
  application?: { id: string; status: ApplicationStatus } | undefined;
  showSave?: boolean;
}) {
  const t = useTranslations("opportunities");
  const applications = useTranslations("applications");
  const format = useFormatter();

  const remote = opportunity.format === "remote";
  const place = remote
    ? t(`format.${opportunity.format}`)
    : opportunity.city
      ? opportunity.city
      : t(`regions.${opportunity.region}`);

  return (
    <article className="flex w-full flex-col rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink-muted">
        <OpportunityStatusChip opportunity={opportunity} now={now} />
        {application ? <ApplicationStatusChip status={application.status} /> : null}
        <DeadlineText deadline={opportunity.applicationDeadline} now={now} />
      </div>

      <h3 className="mt-3 text-title font-semibold text-balance">
        <Link
          href={opportunityHref(opportunity.slug)}
          className="text-ink hover:text-primary-ink"
        >
          {opportunity.title}
        </Link>
      </h3>

      <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 text-sm text-ink-muted">
        <span>{opportunity.organization.name}</span>
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
        {opportunity.estimatedTotalHours !== undefined ? (
          <li className="inline-flex items-center gap-1.5">
            <Clock3 aria-hidden="true" className="size-3.5" />
            {t("estimatedHours", { hours: opportunity.estimatedTotalHours })}
          </li>
        ) : null}
      </ul>

      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        {showSave ? (
          <SaveButton
            opportunityId={opportunity.id}
            saved={saved}
            saveLabel={t("card.save")}
            savedLabel={t("card.saved")}
            errorLabel={t("card.saveError")}
            className="-ml-4"
          />
        ) : (
          <span />
        )}
        <Link
          href={
            application
              ? applicationHref(application.id)
              : opportunityHref(opportunity.slug)
          }
          className={buttonClass({ variant: "outline", size: "sm" })}
        >
          {application
            ? application.status === "draft"
              ? applications("card.continue")
              : application.status === "accepted"
                ? applications("card.attendance")
                : applications("card.track")
            : t("card.view")}
        </Link>
      </div>
    </article>
  );
}
