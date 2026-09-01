import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { getMyProfile } from "@/features/profile/api.server";
import { profileCompletion } from "@/features/profile/schemas";
import { listMyApplications } from "@/features/applications/api.server";
import { ApplicationStatusBadge } from "@/components/applications/application-status";
import { ProfileCompletionCard } from "@/components/volunteers/profile-completion";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";

export default async function DashboardPage(props: PageProps<"/[locale]/dashboard">) {
  const { locale } = await props.params;
  setRequestLocale(locale as Locale);

  const [t, nav, applicationsT] = await Promise.all([
    getTranslations("profile"),
    getTranslations("nav"),
    getTranslations("applications"),
  ]);

  const [profileResult, applicationsResult] = await Promise.allSettled([
    getMyProfile(),
    listMyApplications(null),
  ]);

  const profile = profileResult.status === "fulfilled" ? profileResult.value : null;
  const applications =
    applicationsResult.status === "fulfilled"
      ? applicationsResult.value.items.slice(0, 3)
      : [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={nav("dashboard")} />

      {profile ? (
        <ProfileCompletionCard
          completion={profileCompletion(profile)}
          fieldLabels={profileCompletion(profile).missing.map((field) =>
            field === "contact" ? t("sections.contact") : t(`fields.${field}`),
          )}
        />
      ) : null}

      <section aria-labelledby="recent" className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <h2 id="recent" className="text-lg">
            {applicationsT("list.title")}
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/applications">
              {nav("applications")}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
        </div>

        {applications.length === 0 ? (
          <Surface tone="quiet" padding="md">
            <p className="text-sm text-ink-muted">{applicationsT("list.emptyBody")}</p>
          </Surface>
        ) : (
          <ul className="flex flex-col gap-2">
            {applications.map((application) => (
              <li key={application.id}>
                <Surface
                  padding="sm"
                  className="flex items-center justify-between gap-3"
                >
                  <Link
                    href={`/applications/${application.id}`}
                    className="text-sm font-bold text-ink hover:text-blue-deep"
                  >
                    {application.opportunity.title}
                  </Link>
                  <ApplicationStatusBadge status={application.status} />
                </Surface>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
