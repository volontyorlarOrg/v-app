import { ArrowLeft } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Panel } from "@/components/app/panel";
import { PageHeader } from "@/components/app/page-header";
import { AnswersForm, type AnswerField } from "@/components/applications/answers-form";
import { ApplicationTimeline } from "@/components/applications/application-timeline";
import { WithdrawForm } from "@/components/applications/withdraw-form";
import { ApplicationStatusChip } from "@/components/dashboard/application-status";
import { OpportunityFacts } from "@/components/opportunities/opportunity-facts";
import { buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getApplication } from "@/lib/api/applications.server";
import { getOpportunity } from "@/lib/api/opportunities.server";
import { getProfile } from "@/lib/api/profile.server";
import {
  canWithdrawApplication,
  isEditable,
  type AnswerValue,
  type ApplicationDetail,
  type ProfileSnapshot,
} from "@/lib/applications/status";
import { canApply } from "@/lib/opportunities/deadline";
import { isRegion, type ApplicationQuestion } from "@/lib/opportunities/types";
import { languageDirectory } from "@/lib/profile/language-directory.server";
import { localePath, navHref, opportunityHref } from "@/lib/routing/routes";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/applications/[id]">): Promise<Metadata> {
  const { id } = await params;
  const application = await getApplication(id);
  return application ? { title: application.opportunity.title } : {};
}

export default async function ApplicationPage({
  params,
}: PageProps<"/[locale]/applications/[id]">) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const now = new Date();
  const application = await getApplication(id);
  if (!application) notFound();

  const [opportunity, profile] = await Promise.all([
    getOpportunity(application.opportunity.slug),
    application.profileSnapshot ? null : getProfile(),
  ]);

  const snapshot: ProfileSnapshot = application.profileSnapshot ?? {
    fullName: profile?.fullName,
    bio: profile?.bio,
    region: profile?.region ?? undefined,
    school: profile?.school,
    languages: profile?.languages,
    phone: profile?.phone,
    telegram: profile?.telegram,
  };

  return (
    <Application
      application={application}
      questions={opportunity?.questions ?? null}
      open={opportunity ? canApply(opportunity, now) : false}
      snapshot={snapshot}
      now={now}
    />
  );
}

function answerText(
  value: AnswerValue,
  question: ApplicationQuestion | undefined,
): string {
  if (typeof value === "string") {
    return question?.options?.find((option) => option.value === value)?.label ?? value;
  }
  return value
    .map(
      (item) =>
        question?.options?.find((option) => option.value === item)?.label ?? item,
    )
    .join(", ");
}

function Application({
  application,
  questions,
  open,
  snapshot,
  now,
}: {
  application: ApplicationDetail;
  questions: readonly ApplicationQuestion[] | null;
  open: boolean;
  snapshot: ProfileSnapshot;
  now: Date;
}) {
  const t = useTranslations("applications");
  const profileT = useTranslations("profile");
  const opportunitiesT = useTranslations("opportunities");
  const locale = useLocale() as Locale;
  const format = useFormatter();

  const questionById = new Map(
    (questions ?? []).map((question) => [question.id, question]),
  );
  const draft = isEditable(application.status);
  const sendable = draft && open && questions !== null;
  const profileOnly = questions !== null && questions.length === 0;
  const confirmedHours = application.attendance?.confirmedHours;
  const answers = Object.fromEntries(
    application.answers
      .filter((answer): answer is typeof answer & { questionId: string } =>
        Boolean(answer.questionId),
      )
      .map((answer) => [answer.questionId, answer.value]),
  ) as Record<string, AnswerValue>;

  const fields: AnswerField[] = (questions ?? []).map((question) => ({
    ...question,
    help: [
      question.helpText,
      question.required
        ? opportunitiesT("detail.required")
        : opportunitiesT("detail.optional"),
      question.maxLength
        ? opportunitiesT("detail.maxLength", { count: question.maxLength })
        : null,
    ]
      .filter(Boolean)
      .join(" · "),
  }));

  const rows = [
    {
      key: "fullName",
      label: profileT("fields.fullName"),
      value: snapshot.fullName?.trim() || "—",
    },
    {
      key: "bio",
      label: t("detail.snapshot.bio"),
      value: snapshot.bio?.trim() || "—",
    },
    {
      key: "region",
      label: profileT("fields.region"),
      value: isRegion(snapshot.region)
        ? opportunitiesT(`regions.${snapshot.region}`)
        : "—",
    },
    {
      key: "school",
      label: profileT("fields.school"),
      value: snapshot.school?.trim() || "—",
    },
    {
      key: "languages",
      label: t("detail.snapshot.languages"),
      value: languageDirectory.format(snapshot.languages ?? [], locale) || "—",
    },
    {
      key: "contact",
      label: profileT("fields.contact"),
      value:
        [
          snapshot.phone?.trim() || null,
          snapshot.telegram?.trim() ? `@${snapshot.telegram.trim()}` : null,
        ]
          .filter(Boolean)
          .join(" · ") || "—",
    },
  ];

  return (
    <>
      <Link
        href={navHref("applications")}
        className="enter-rise inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold text-primary-ink underline-offset-4 hover:underline"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {t("detail.back")}
      </Link>

      <PageHeader
        className="mt-3"
        title={application.opportunity.title}
        description={application.opportunity.organization.name}
        actions={<ApplicationStatusChip status={application.status} />}
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <Panel id="timeline" title={t("detail.timeline")}>
            <ApplicationTimeline application={application} />
          </Panel>

          {sendable && profileOnly ? (
            <Panel
              id="send"
              title={t("detail.send.title")}
              description={t("detail.send.description")}
            >
              <AnswersForm
                applicationId={application.id}
                questions={fields}
                answers={answers}
                labels={answersLabels(t, localePath(locale, "profileEdit"))}
              />
            </Panel>
          ) : sendable ? (
            <Panel id="answers" title={t("detail.answers")}>
              <AnswersForm
                applicationId={application.id}
                questions={fields}
                answers={answers}
                labels={answersLabels(t, localePath(locale, "profileEdit"))}
              />
            </Panel>
          ) : application.answers.length > 0 ? (
            <Panel id="answers" title={t("detail.answers")}>
              <dl className="flex flex-col gap-5">
                {application.answers.map((answer, index) => {
                  const question = answer.questionId
                    ? questionById.get(answer.questionId)
                    : undefined;
                  return (
                    <div key={answer.questionId ?? index}>
                      <dt className="font-semibold text-ink">
                        {answer.prompt ??
                          question?.prompt ??
                          t("detail.question", { number: index + 1 })}
                      </dt>
                      <dd className="mt-1.5 leading-relaxed whitespace-pre-line text-ink-muted">
                        {answerText(answer.value, question)}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </Panel>
          ) : null}

          {draft && !sendable ? (
            <Panel id="closed">
              <p className="text-sm leading-relaxed text-ink-muted">
                {t("detail.draftClosed")}
              </p>
            </Panel>
          ) : null}

          {application.reviewerNote ? (
            <Panel id="reviewer-note" title={t("detail.reviewerNote")}>
              <p className="leading-relaxed whitespace-pre-line text-ink">
                {application.reviewerNote}
              </p>
            </Panel>
          ) : null}

          {application.status === "accepted" ? (
            <Panel
              id="attendance"
              title={t("attendance.title")}
              description={
                confirmedHours === undefined ? t("attendance.description") : undefined
              }
            >
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase">
                    {t("attendance.state")}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-ink">
                    {t(
                      `attendance.outcome.${application.attendance?.outcome ?? "awaiting_confirmation"}`,
                    )}
                  </dd>
                </div>
                {confirmedHours === undefined ? null : (
                  <div>
                    <dt className="text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase">
                      {t("attendance.hours")}
                    </dt>
                    <dd className="tabular mt-1 text-sm font-semibold text-accent-ink">
                      {format.number(confirmedHours)}
                    </dd>
                  </div>
                )}
              </dl>
            </Panel>
          ) : null}

          <Panel
            id="snapshot"
            title={t("detail.fromProfile")}
            description={
              draft ? t("detail.fromProfileDraft") : t("detail.fromProfileHelp")
            }
          >
            <dl className="grid gap-4 sm:grid-cols-2">
              {rows.map((item) => (
                <div key={item.key}>
                  <dt className="text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase">
                    {item.label}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-ink">{item.value}</dd>
                </div>
              ))}
            </dl>
          </Panel>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Panel id="opportunity" title={opportunitiesT("detail.facts")}>
            <OpportunityFacts opportunity={application.opportunity} now={now} />
            {questions === null ? null : (
              <Link
                href={opportunityHref(application.opportunity.slug)}
                className={buttonClass({
                  variant: "outline",
                  size: "sm",
                  className: "mt-5 w-full",
                })}
              >
                {t("detail.viewOpportunity")}
              </Link>
            )}
          </Panel>

          {canWithdrawApplication(application, now) ? (
            <Panel id="actions">
              <WithdrawForm
                applicationId={application.id}
                labels={{
                  withdraw: t("detail.withdraw"),
                  confirm: t("detail.withdrawConfirm"),
                  yes: t("detail.withdrawYes"),
                  withdrawing: t("detail.withdrawing"),
                  cancel: t("detail.cancel"),
                  errors: {
                    applicationCannotBeWithdrawn: t(
                      "detail.withdrawErrors.applicationCannotBeWithdrawn",
                    ),
                  },
                  fallback: t("detail.withdrawErrors.fallback"),
                }}
              />
            </Panel>
          ) : null}
        </div>
      </div>
    </>
  );
}

function answersLabels(
  t: ReturnType<typeof useTranslations<"applications">>,
  profileHref: string,
) {
  return {
    save: t("form.save"),
    saving: t("form.saving"),
    submit: t("form.submit"),
    submitting: t("form.submitting"),
    savedDraft: t("form.savedDraft"),
    choose: t("form.choose"),
    fieldRequired: t("form.fieldRequired"),
    fieldInvalid: t("form.fieldInvalid"),
    errors: {
      profileRequired: t("form.errors.profileRequired"),
      profileIncomplete: t("form.errors.profileIncomplete"),
      opportunityUnavailable: t("form.errors.opportunityUnavailable"),
      invalidAnswers: t("form.errors.invalidAnswers"),
      applicationNotEditable: t("form.errors.applicationNotEditable"),
    },
    fallback: t("form.errors.fallback"),
    profileLink: { href: profileHref, label: t("form.errors.profileLink") },
  };
}
