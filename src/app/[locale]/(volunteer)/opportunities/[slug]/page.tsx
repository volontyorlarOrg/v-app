import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Panel } from "@/components/app/panel";
import { PageHeader } from "@/components/app/page-header";
import { StatusChip } from "@/components/app/section";
import { OpportunityStatusChip } from "@/components/dashboard/opportunity-status";
import { ApplyForm } from "@/components/opportunities/apply-form";
import { OpportunityFacts } from "@/components/opportunities/opportunity-facts";
import { SaveButton } from "@/components/opportunities/save-button";
import { buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getApplicationByOpportunity } from "@/lib/api/applications.server";
import { getOpportunity } from "@/lib/api/opportunities.server";
import { listSaved, savedIds } from "@/lib/api/saved.server";
import type { ApplicationStatus } from "@/lib/applications/status";
import { canApply } from "@/lib/opportunities/deadline";
import type { OpportunityDetail } from "@/lib/opportunities/types";
import { applicationHref, navHref } from "@/lib/routing/routes";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/opportunities/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const opportunity = await getOpportunity(slug);
  return opportunity ? { title: opportunity.title } : {};
}

export default async function OpportunityPage({
  params,
}: PageProps<"/[locale]/opportunities/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const now = new Date();
  const [opportunity, saved] = await Promise.all([getOpportunity(slug), listSaved()]);
  if (!opportunity) notFound();

  const application = await getApplicationByOpportunity(opportunity.id);

  return (
    <Opportunity
      opportunity={opportunity}
      saved={savedIds(saved).has(opportunity.id)}
      application={application ? { id: application.id, status: application.status } : null}
      now={now}
    />
  );
}

function Opportunity({
  opportunity,
  saved,
  application,
  now,
}: {
  opportunity: OpportunityDetail;
  saved: boolean;
  application: { id: string; status: ApplicationStatus } | null;
  now: Date;
}) {
  const t = useTranslations("opportunities");
  const applicationsT = useTranslations("applications");
  const applicable = canApply(opportunity, now);

  return (
    <>
      <Link
        href={navHref("opportunities")}
        className="enter-rise inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold text-primary-ink underline-offset-4 hover:underline"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {t("detail.back")}
      </Link>

      <PageHeader
        className="mt-3"
        eyebrow={opportunity.organization.name}
        title={opportunity.title}
        actions={
          <>
            <OpportunityStatusChip opportunity={opportunity} now={now} />
            {opportunity.sourcedByTeam ? (
              <StatusChip>{t("card.sourced")}</StatusChip>
            ) : null}
          </>
        }
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <Panel id="about" title={t("detail.description")}>
            <p className="max-w-prose leading-relaxed whitespace-pre-line text-ink">
              {opportunity.description}
            </p>
          </Panel>

          {opportunity.requirements.length > 0 ? (
            <Panel id="requirements" title={t("detail.requirements")}>
              <ul className="flex flex-col gap-2">
                {opportunity.requirements.map((requirement, index) => (
                  <li key={`${index}-${requirement}`} className="flex gap-3 text-ink">
                    <span
                      aria-hidden="true"
                      className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary"
                    />
                    {requirement}
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}

          <Panel
            id="questions"
            title={t("detail.questions")}
            description={t("detail.questionCount", {
              count: opportunity.questions.length,
            })}
          >
            {opportunity.questions.length === 0 ? (
              <p className="text-sm text-ink-muted">{t("detail.noQuestions")}</p>
            ) : (
              <ol className="flex flex-col gap-5">
                {opportunity.questions.map((question, index) => (
                  <li key={question.id} className="grid grid-cols-[2rem_1fr] gap-x-3">
                    <span className="tabular pt-0.5 text-xs font-semibold tracking-[0.14em] text-primary-ink uppercase">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-semibold text-ink">{question.prompt}</p>
                      {question.helpText ? (
                        <p className="mt-1 text-sm text-ink-muted">{question.helpText}</p>
                      ) : null}
                      <p className="mt-1.5 text-xs text-ink-muted">
                        {question.required
                          ? t("detail.required")
                          : t("detail.optional")}
                        {question.maxLength
                          ? ` · ${t("detail.maxLength", { count: question.maxLength })}`
                          : null}
                        {question.options
                          ? ` · ${question.options.map((option) => option.label).join(" / ")}`
                          : null}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Panel id="facts" title={t("detail.facts")}>
            <OpportunityFacts opportunity={opportunity} now={now} />
          </Panel>

          <Panel id="apply">
            {application ? (
              <Link
                href={applicationHref(application.id)}
                className={buttonClass({ className: "w-full" })}
              >
                {application.status === "draft"
                  ? applicationsT("continueDraft")
                  : t("detail.viewApplication")}
              </Link>
            ) : applicable ? (
              <ApplyForm
                opportunityId={opportunity.id}
                labels={{
                  apply: t("detail.apply"),
                  applying: t("detail.applying"),
                  errors: {
                    opportunityUnavailable: t("detail.applyErrors.opportunityUnavailable"),
                    opportunityNotFound: t("detail.applyErrors.opportunityNotFound"),
                  },
                  fallback: t("detail.applyErrors.fallback"),
                }}
              />
            ) : (
              <button
                type="button"
                disabled
                className={buttonClass({ className: "w-full disabled:opacity-50" })}
              >
                {t("detail.applyClosed")}
              </button>
            )}
            <SaveButton
              opportunityId={opportunity.id}
              saved={saved}
              saveLabel={t("card.save")}
              savedLabel={t("card.saved")}
              errorLabel={t("card.saveError")}
              className="mt-3 -ml-4"
            />
          </Panel>
        </div>
      </div>
    </>
  );
}
