import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { getOpportunity } from "@/features/opportunities/api.server";
import { canApply } from "@/features/opportunities/deadline";
import { startApplication } from "@/features/applications/api.server";
import { isEditable } from "@/features/applications/schemas";
import { ApplicationForm } from "@/components/applications/application-form";
import { ApplicationStatusBadge } from "@/components/applications/application-status";
import { ApiErrorState } from "@/components/shared/api-error-state";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/states";

/**
 * Start or resume an application.
 *
 * `startApplication` is idempotent, so arriving here twice resumes the same
 * draft instead of creating a second one — a double-tapped Apply button and a
 * re-opened Telegram link both land here.
 */
export default async function NewApplicationPage(
  props: PageProps<"/[locale]/applications/new/[slug]">,
) {
  const { locale, slug } = await props.params;
  setRequestLocale(locale as Locale);

  const [t, opportunities] = await Promise.all([
    getTranslations("applications"),
    getTranslations("opportunities"),
  ]);

  const opportunity = await getOpportunity(slug);
  if (!opportunity) notFound();

  if (!canApply(opportunity)) {
    return (
      <EmptyState
        title={opportunities("cta.applyClosed")}
        body={opportunities("deadline.passed")}
        action={
          <Button asChild>
            <Link href={`/opportunities/${slug}`}>
              {opportunities("detail.backToList")}
            </Link>
          </Button>
        }
        className="my-12"
      />
    );
  }

  let application;

  try {
    application = await startApplication(opportunity.id);
  } catch (error) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={t("form.title", { opportunity: opportunity.title })} />
        <ApiErrorState error={error} />
      </div>
    );
  }

  const answers = Object.fromEntries(
    application.answers.map((answer) => [answer.questionId, answer.value]),
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("form.title", { opportunity: opportunity.title })}
        eyebrow={<ApplicationStatusBadge status={application.status} />}
      />

      <ApplicationForm
        applicationId={application.id}
        opportunityTitle={opportunity.title}
        questions={opportunity.questions}
        defaultAnswers={answers}
        editable={isEditable(application.status)}
      />
    </div>
  );
}
