import { notFound } from "next/navigation";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { getMyApplication } from "@/features/applications/api.server";
import { isEditable, isWithdrawable } from "@/features/applications/schemas";
import { ApplicationForm } from "@/components/applications/application-form";
import {
  ApplicationStatusBadge,
  ApplicationStatusHelp,
} from "@/components/applications/application-status";
import { WithdrawButton } from "@/components/applications/withdraw-button";
import { ApiErrorState } from "@/components/shared/api-error-state";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";

/**
 * One application.
 *
 * A draft renders the editable form; anything submitted renders read-only
 * answers. The distinction comes from `isEditable`, not from a status string
 * compared inline, so "which states can still be changed" has one definition.
 */
export default async function ApplicationDetailPage(
  props: PageProps<"/[locale]/applications/[applicationId]">,
) {
  const { locale, applicationId } = await props.params;
  setRequestLocale(locale as Locale);

  const [t, format] = await Promise.all([
    getTranslations("applications"),
    getFormatter(),
  ]);

  let application;

  try {
    application = await getMyApplication(applicationId);
  } catch (error) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={t("detail.title")} />
        <ApiErrorState error={error} />
      </div>
    );
  }

  if (!application) notFound();

  const editable = isEditable(application.status);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={application.opportunity.title}
        eyebrow={<ApplicationStatusBadge status={application.status} />}
        actions={
          isWithdrawable(application.status) ? (
            <WithdrawButton applicationId={application.id} />
          ) : undefined
        }
      />

      <Surface padding="md" className="flex flex-col gap-3">
        <ApplicationStatusHelp status={application.status} />

        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-extrabold tracking-[0.14em] text-muted uppercase">
              {t("detail.opportunity")}
            </dt>
            <dd className="mt-1">
              <Link
                href={`/opportunities/${application.opportunity.slug}`}
                className="text-teal underline-offset-4 hover:underline"
              >
                {application.opportunity.title}
              </Link>
            </dd>
          </div>

          {application.submittedAt ? (
            <div>
              <dt className="text-xs font-extrabold tracking-[0.14em] text-muted uppercase">
                {t("detail.submittedOn")}
              </dt>
              <dd className="mt-1 text-ink">
                <time dateTime={application.submittedAt}>
                  {format.dateTime(new Date(application.submittedAt), "long")}
                </time>
              </dd>
            </div>
          ) : null}
        </dl>
      </Surface>

      {editable ? (
        <ApplicationForm
          applicationId={application.id}
          opportunityTitle={application.opportunity.title}
          questions={[]}
          defaultAnswers={Object.fromEntries(
            application.answers.map((a) => [a.questionId, a.value]),
          )}
          editable
        />
      ) : (
        <section aria-labelledby="answers" className="flex flex-col gap-4">
          <h2 id="answers" className="text-lg">
            {t("detail.yourAnswers")}
          </h2>

          {application.answers.map((answer) => (
            <Surface key={answer.questionId} padding="md" tone="field">
              <p className="whitespace-pre-line leading-7 text-muted">
                {Array.isArray(answer.value)
                  ? answer.value.join(", ")
                  : answer.value}
              </p>
            </Surface>
          ))}
        </section>
      )}
    </div>
  );
}
