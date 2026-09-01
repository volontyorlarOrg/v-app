import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { FileText } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { listMyApplications } from "@/features/applications/api.server";
import { ApplicationStatusBadge } from "@/components/applications/application-status";
import { ApiErrorState } from "@/components/shared/api-error-state";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { EmptyState } from "@/components/ui/states";

/** Every application the volunteer has started, newest first. */
export default async function ApplicationsPage(
  props: PageProps<"/[locale]/applications">,
) {
  const { locale } = await props.params;
  setRequestLocale(locale as Locale);

  const [t, common, format] = await Promise.all([
    getTranslations("applications"),
    getTranslations("common"),
    getFormatter(),
  ]);

  let applications;

  try {
    applications = await listMyApplications(null);
  } catch (error) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={t("list.title")} description={t("list.subtitle")} />
        <ApiErrorState error={error} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("list.title")} description={t("list.subtitle")} />

      {applications.items.length === 0 ? (
        <EmptyState
          icon={<FileText />}
          title={t("list.emptyTitle")}
          body={t("list.emptyBody")}
          action={
            <Button asChild>
              <Link href="/opportunities">{common("action.search")}</Link>
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {applications.items.map((application) => (
            <li key={application.id}>
              <Surface
                padding="none"
                className="transition-colors focus-within:border-teal hover:border-teal/60"
              >
                <Link
                  href={`/applications/${application.id}`}
                  className="flex flex-col gap-2 p-5 focus-visible:outline-none"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <ApplicationStatusBadge status={application.status} />
                    <span className="text-xs text-muted">
                      {application.submittedAt
                        ? t("list.appliedOn", {
                            date: format.dateTime(
                              new Date(application.submittedAt),
                              "short",
                            ),
                          })
                        : t("list.startedOn", {
                            date: format.dateTime(
                              new Date(application.createdAt),
                              "short",
                            ),
                          })}
                    </span>
                  </div>

                  <h2 className="font-display text-base font-semibold text-ink">
                    {application.opportunity.title}
                  </h2>

                  <p className="text-xs text-muted">
                    {application.opportunity.organization.name}
                  </p>
                </Link>
              </Surface>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
