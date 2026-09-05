import { useFormatter, useTranslations } from "next-intl";

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
    return (
      <div className="px-5 py-8 text-center">
        <p className="font-semibold text-ink">{empty.title}</p>
        <p className="mt-1 text-sm text-ink-muted">{empty.body}</p>
      </div>
    );
  }

  return (
    <ul>
      {applications.map((application) => (
        <li
          key={application.id}
          className="border-t border-border px-5 py-4 first:border-t-0"
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink-muted">
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
          <h3 className="mt-2 text-base font-semibold text-balance">
            <Link
              href={applicationHref(application.id)}
              className="text-ink hover:text-primary-ink"
            >
              {application.opportunity.title}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-ink-muted">
            {application.opportunity.organization.name}
            {application.status === "draft" ? (
              <>
                {" · "}
                <Link
                  href={applicationHref(application.id)}
                  className="font-semibold text-primary-ink underline-offset-4 hover:underline"
                >
                  {t("continueDraft")}
                </Link>
              </>
            ) : null}
          </p>
        </li>
      ))}
    </ul>
  );
}
