import { BadgeCheck, MapPin, Monitor } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Surface } from "@/components/ui/surface";
import type { OpportunitySummary } from "@/features/opportunities/schemas";
import { OpportunityDeadline } from "./opportunity-deadline";
import { OpportunityStatusBadge } from "./opportunity-status";

/**
 * The list card. Server-rendered — a list of forty of these should cost no
 * client JavaScript at all.
 *
 * The whole card is one link rather than a card with a link inside it: on a
 * phone the entire block is the tap target, and there is exactly one tab stop
 * per result instead of three.
 */
export function OpportunityCard({
  opportunity,
  now,
}: {
  opportunity: OpportunitySummary;
  now?: Date;
}) {
  const t = useTranslations("opportunities");
  const format = useFormatter();

  const remote = opportunity.format === "remote";
  const place = remote
    ? t(`format.${opportunity.format}`)
    : (opportunity.city ?? t(`regions.${opportunity.region}`));

  return (
    <Surface
      as="article"
      padding="none"
      className="transition-colors focus-within:border-teal hover:border-teal/60"
    >
      <Link
        href={`/opportunities/${opportunity.slug}`}
        className="flex h-full flex-col gap-3 p-5 focus-visible:outline-none"
      >
        <div className="flex flex-wrap items-center gap-2">
          <OpportunityStatusBadge opportunity={opportunity} now={now} />
          <OpportunityDeadline
            deadline={opportunity.applicationDeadline}
            now={now}
          />
        </div>

        <h3 className="font-display text-lg leading-snug font-semibold text-ink">
          {opportunity.title}
        </h3>

        <p className="line-clamp-3 text-sm leading-6 text-muted">
          {opportunity.summary}
        </p>

        <div className="mt-auto flex flex-col gap-2 pt-2 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            {opportunity.organization.name}
            {opportunity.organization.verified ? (
              // Title, not just colour: the check means "YVC verified this
              // organiser", which is not guessable from a teal tick.
              <BadgeCheck
                aria-label={t("detail.sourcedBy")}
                className="size-3.5 text-teal"
              />
            ) : null}
          </span>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span className="inline-flex items-center gap-1.5">
              {remote ? (
                <Monitor aria-hidden="true" className="size-3.5" />
              ) : (
                <MapPin aria-hidden="true" className="size-3.5" />
              )}
              {place}
            </span>

            <time dateTime={opportunity.startsAt}>
              {format.dateTime(new Date(opportunity.startsAt), "short")}
            </time>

            {opportunity.spotsRemaining !== undefined &&
            opportunity.spotsRemaining > 0 ? (
              <Badge tone="signalQuiet">
                {t("detail.spotsLeft", { count: opportunity.spotsRemaining })}
              </Badge>
            ) : null}
          </div>
        </div>
      </Link>
    </Surface>
  );
}
