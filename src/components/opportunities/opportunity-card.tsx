import { BadgeCheck, CalendarDays, Clock, MapPin, Monitor, Users } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { ApplicationStatusChip } from "@/components/dashboard/application-status";
import {
  DeadlineText,
  OpportunityStatusChip,
} from "@/components/dashboard/opportunity-status";
import { SaveButton } from "@/components/opportunities/save-button";
import { buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cardAction, type CardApplication } from "@/lib/opportunities/card";
import type { OpportunitySummary } from "@/lib/opportunities/types";
import { opportunityHref } from "@/lib/routing/routes";

export function OpportunityCard({
  opportunity,
  saved,
  application = null,
  now,
}: {
  opportunity: OpportunitySummary;
  saved: boolean;
  application?: CardApplication | null;
  now: Date;
}) {
  const t = useTranslations("opportunities");
  const format = useFormatter();

  const remote = opportunity.format === "remote";
  const place = remote
    ? t(`format.${opportunity.format}`)
    : opportunity.city
      ? opportunity.city
      : t(`regions.${opportunity.region}`);

  const starts = new Date(opportunity.startsAt);
  const ends = opportunity.endsAt ? new Date(opportunity.endsAt) : null;
  const sameDay = ends
    ? format.dateTime(starts, "day") === format.dateTime(ends, "day")
    : true;
  const action = cardAction(opportunity, application, now);

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
            {format.dateTime(starts, "day")}
            {ends && !sameDay ? ` – ${format.dateTime(ends, "day")}` : null}
          </time>
        </li>
        {opportunity.estimatedTotalHours === undefined ? null : (
          <li className="inline-flex items-center gap-1.5">
            <Clock aria-hidden="true" className="size-3.5" />
            <span className="tabular">
              {t("estimatedHours", { hours: opportunity.estimatedTotalHours })}
            </span>
          </li>
        )}
        {opportunity.spotsRemaining !== undefined ? (
          <li className="inline-flex items-center gap-1.5">
            <Users aria-hidden="true" className="size-3.5" />
            <span className="tabular">
              {opportunity.spotsRemaining > 0
                ? t("spotsLeft", { count: opportunity.spotsRemaining })
                : t("noSpotsLeft")}
            </span>
          </li>
        ) : opportunity.capacity === undefined ? null : (
          <li className="inline-flex items-center gap-1.5">
            <Users aria-hidden="true" className="size-3.5" />
            <span className="tabular">
              {t("placesWanted", { count: opportunity.capacity })}
            </span>
          </li>
        )}
      </ul>

      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <SaveButton
          opportunityId={opportunity.id}
          saved={saved}
          saveLabel={t("card.save")}
          savedLabel={t("card.saved")}
          errorLabel={t("card.saveError")}
          className="-ml-4"
        />
        <Link
          href={action.href}
          className={buttonClass({
            variant: action.kind === "view" ? "outline" : "primary",
            size: "sm",
          })}
        >
          {t(`card.actions.${action.kind}`)}
          <span className="sr-only"> — {opportunity.title}</span>
        </Link>
      </div>
    </article>
  );
}
