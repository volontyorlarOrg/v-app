import {
  BadgeCheck,
  CalendarDays,
  Clock3,
  HandHeart,
  MapPin,
  Monitor,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { useFormatter, useTranslations } from "next-intl";

import {
  DeadlineText,
  OpportunityStatusChip,
} from "@/components/dashboard/opportunity-status";
import { ApplicationStatusChip } from "@/components/dashboard/application-status";
import { SaveButton } from "@/components/opportunities/save-button";
import { Link } from "@/i18n/navigation";
import type { ApplicationStatus } from "@/lib/applications/status";
import { displayStatus } from "@/lib/opportunities/deadline";
import type { OpportunityKind, OpportunitySummary } from "@/lib/opportunities/types";
import { opportunityImageUrl } from "@/lib/opportunities/image";
import { applicationHref, opportunityHref } from "@/lib/routing/routes";
import { cn } from "@/lib/utils";

const KIND_ICON: Record<OpportunityKind, LucideIcon> = {
  volunteering: HandHeart,
  competition: Trophy,
};

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
  const photo = opportunityImageUrl(opportunity.imageUrl);
  const KindIcon = KIND_ICON[opportunity.kind];
  const status = displayStatus(opportunity, now);
  const unavailable = status === "closed" || status === "full";

  const remote = opportunity.format === "remote";
  const place = remote
    ? t(`format.${opportunity.format}`)
    : opportunity.city
      ? opportunity.city
      : t(`regions.${opportunity.region}`);

  return (
    <article className="flex w-full flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-panel transition-colors hover:border-border-control">
      <div className="relative aspect-[2/1] overflow-hidden border-b border-border bg-surface-sunk">
        {photo ? (
          <Image
            unoptimized
            src={photo}
            alt=""
            width={960}
            height={480}
            className="size-full object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="opportunity-card-art flex size-full items-center justify-center text-primary"
          >
            <KindIcon className="size-7 opacity-60" />
          </div>
        )}

        <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-sm bg-surface px-1.5 py-0.5 text-xs font-medium text-primary">
          <KindIcon aria-hidden="true" className="size-3.5" />
          {t(`kinds.${opportunity.kind}`)}
        </span>

        {showSave ? (
          <SaveButton
            opportunityId={opportunity.id}
            saved={saved}
            saveLabel={t("card.save")}
            savedLabel={t("card.saved")}
            errorLabel={t("card.saveError")}
            variant="icon"
            className="absolute top-2 right-2"
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-balance">
              <Link
                href={opportunityHref(opportunity.slug)}
                className="text-ink hover:text-primary"
              >
                {opportunity.title}
              </Link>
            </h3>
            <p className="flex flex-wrap items-center gap-x-1 text-sm text-ink-muted">
              <span>{opportunity.organization.name}</span>
              {opportunity.organization.verified ? (
                <BadgeCheck
                  aria-label={t("verified")}
                  className="size-3.5 text-primary"
                />
              ) : null}
            </p>
          </div>
          {application ? (
            <ApplicationStatusChip status={application.status} />
          ) : unavailable ? (
            <OpportunityStatusChip opportunity={opportunity} now={now} />
          ) : null}
        </div>

        <ul className="mt-3 grid gap-1 text-sm text-ink-muted">
          <li className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays aria-hidden="true" className="size-3.5 text-primary" />
              <time dateTime={opportunity.startsAt} className="tabular">
                {format.dateTime(new Date(opportunity.startsAt), "day")}
              </time>
            </span>
            <span className="inline-flex items-center gap-1.5">
              {remote ? (
                <Monitor aria-hidden="true" className="size-3.5 text-primary" />
              ) : (
                <MapPin aria-hidden="true" className="size-3.5 text-primary" />
              )}
              {place}
            </span>
          </li>
          <li
            className={cn(
              "inline-flex items-center gap-1.5",
              unavailable ? "text-ink-muted" : "font-medium text-primary",
            )}
          >
            <Clock3 aria-hidden="true" className="size-3.5" />
            <DeadlineText deadline={opportunity.applicationDeadline} now={now} />
          </li>
        </ul>

        {opportunity.publishedAt ? (
          <p className="mt-2 text-xs text-ink-muted">
            {t("card.posted", {
              date: format.dateTime(new Date(opportunity.publishedAt), "day"),
            })}
          </p>
        ) : null}

        <div className="mt-auto pt-2">
          <Link
            href={
              application
                ? applicationHref(application.id)
                : opportunityHref(opportunity.slug)
            }
            className="-mb-2 inline-flex min-h-(--control-sm) items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
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
      </div>
    </article>
  );
}
