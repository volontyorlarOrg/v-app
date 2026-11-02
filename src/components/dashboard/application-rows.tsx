import { useFormatter, useTranslations } from "next-intl";

import { EmptyState } from "@/components/app/empty-state";
import { ApplicationStatusChip } from "@/components/dashboard/application-status";
import { DeadlineText } from "@/components/dashboard/opportunity-status";
import { Link } from "@/i18n/navigation";
import type { ApplicationSummary } from "@/lib/applications/status";
import { applicationHref } from "@/lib/routing/routes";

export function ApplicationRows({
  applications,
  now,
  empty,
}: {
  applications: readonly ApplicationSummary[];
  now: Date;
  empty: { title: string; body: string };
}) {
  const t = useTranslations("applications");
  const format = useFormatter();

  if (applications.length === 0) {
    return <EmptyState title={empty.title} body={empty.body} />;
  }

  return (
    <ul>
      {applications.map((application) => (
        <li
          key={application.id}
          className="border-t border-border px-5 py-3 first:border-t-0"
        >
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted">
            <ApplicationStatusChip status={application.status} />
            {application.status === "draft" ? (
              <DeadlineText
                deadline={application.opportunity.applicationDeadline}
                now={now}
              />
            ) : application.submittedAt ? (
              <span>
                {t("appliedOn", {
                  date: format.dateTime(new Date(application.submittedAt), "day"),
                })}
              </span>
            ) : (
              <span>
                {t("startedOn", {
                  date: format.dateTime(new Date(application.createdAt), "day"),
                })}
              </span>
            )}
          </div>
          <h3 className="mt-1.5 text-sm font-medium text-balance">
            <Link
              href={applicationHref(application.id)}
              className="text-ink hover:text-primary"
            >
              {application.opportunity.title}
            </Link>
          </h3>
          <p className="text-sm text-ink-muted">
            {application.opportunity.organization.name}
            {" · "}
            <Link
              href={applicationHref(application.id)}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {application.status === "draft"
                ? t("continueDraft")
                : application.status === "accepted"
                  ? t("card.attendance")
                  : t("card.track")}
            </Link>
          </p>
        </li>
      ))}
    </ul>
  );
}
