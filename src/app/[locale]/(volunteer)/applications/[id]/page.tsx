import { ArrowLeft } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ActionStatus } from "@/components/app/action-status";
import { Panel } from "@/components/app/panel";
import { PageHeader } from "@/components/app/page-header";
import { AnswersForm, type AnswerField } from "@/components/applications/answers-form";
import { ApplicationTimeline } from "@/components/applications/application-timeline";
import {
  ProfileSummary,
  type ProfileSummaryRow,
} from "@/components/applications/profile-summary";
import { ReviewSubmitForm } from "@/components/applications/review-submit-form";
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
  applicationReadiness,
  type ApplicationReadiness,
} from "@/lib/applications/readiness";
import {
  canWithdraw,
  hasEventEnded,
  isAttendanceResolved,
  isEditable,
  type AnswerValue,
  type ApplicationDetail,
  type ProfileSnapshot,
} from "@/lib/applications/status";
import { isRegion, type ApplicationQuestion } from "@/lib/opportunities/types";
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
    getProfile(),
  ]);

  const snapshot: ProfileSnapshot = application.profileSnapshot ?? {
    fullName: profile?.fullName,
    bio: profile?.bio,
    region: profile?.region ?? undefined,
    city: profile?.city,
    school: profile?.school,
    gradeYear: profile?.gradeYear,
    languages: profile?.languages,
    links: profile?.links,
    phone: profile?.phone,
    telegram: profile?.telegram,
  };

  return (
    <Application
      application={application}
      questions={opportunity?.questions ?? null}
      snapshot={snapshot}
      readiness={applicationReadiness(profile)}
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
  snapshot,
  readiness,
  now,
}: {
  application: ApplicationDetail;
  questions: readonly ApplicationQuestion[] | null;
  snapshot: ProfileSnapshot;
  readiness: ApplicationReadiness;
  now: Date;
}) {
  const t = useTranslations("applications");
  const profileT = useTranslations("profile");
  const opportunitiesT = useTranslations("opportunities");
  const recordT = useTranslations("record");
  const format = useFormatter();
  const locale = useLocale() as Locale;

  const questionById = new Map(
    (questions ?? []).map((question) => [question.id, question]),
  );
  const draft = isEditable(application.status);
  const legacy = (questions?.length ?? 0) > 0;
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

  const empty = "—";
  const list = (values: string[] | undefined) =>
    values && values.length > 0 ? values.join(", ") : empty;
  const optionalRow = (
    key: string,
    label: string,
    value: string | undefined,
  ): ProfileSummaryRow[] =>
    value && value.trim() ? [{ key, label, value: value.trim() }] : [];

  const rows: ProfileSummaryRow[] = [
    {
      key: "fullName",
      label: profileT("fields.fullName"),
      value: snapshot.fullName?.trim() || empty,
    },
    {
      key: "bio",
      label: profileT("fields.bio"),
      value: snapshot.bio?.trim() || empty,
    },
    {
      key: "region",
      label: profileT("fields.region"),
      value: isRegion(snapshot.region)
        ? opportunitiesT(`regions.${snapshot.region}`)
        : empty,
    },
    ...optionalRow("city", profileT("fields.city"), snapshot.city),
    {
      key: "school",
      label: profileT("fields.school"),
      value: snapshot.school?.trim() || empty,
    },
    ...optionalRow("gradeYear", profileT("fields.gradeYear"), snapshot.gradeYear),
    {
      key: "languages",
      label: profileT("fields.languages"),
      value: list(snapshot.languages),
    },
    ...(snapshot.skills && snapshot.skills.length > 0
      ? [
          {
            key: "skills",
            label: t("detail.skills"),
            value: list(snapshot.skills),
          },
        ]
      : []),
    {
      key: "contact",
      label: profileT("fields.contact"),
      value: snapshot.telegram?.trim()
        ? `@${snapshot.telegram.trim()}`
        : snapshot.phone?.trim() || empty,
    },
    ...(snapshot.links && snapshot.links.length > 0
      ? [
          {
            key: "links",
            label: profileT("fields.links"),
            value: list(snapshot.links),
          },
        ]
      : []),
  ];

  const accepted = application.status === "accepted";
  const ended = hasEventEnded(application.opportunity, now);
  const resolved = isAttendanceResolved(application.attendance);
  const withdrawable = canWithdraw(application, now);
  const received =
    application.status === "submitted" || application.status === "under_review";

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
        eyebrow={t("detail.eyebrow")}
        title={application.opportunity.title}
        description={application.opportunity.organization.name}
        actions={<ApplicationStatusChip status={application.status} />}
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-6">
          {received ? (
            <Panel id="receipt" title={t("detail.receipt.title")}>
              <p className="leading-relaxed text-ink">{t("detail.receipt.body")}</p>
              <p className="tabular mt-3 text-sm text-ink-muted">
                {t("detail.receipt.reference", { reference: application.id })}
              </p>
              {application.submittedAt ? (
                <p className="tabular mt-1 text-sm text-ink-muted">
                  {t("appliedOn", {
                    date: format.dateTime(new Date(application.submittedAt), "day"),
                  })}
                </p>
              ) : null}
            </Panel>
          ) : null}

          <Panel id="timeline" title={t("detail.timeline")}>
            <ApplicationTimeline application={application} now={now} />
          </Panel>

          {draft && legacy ? (
            <Panel id="answers" title={t("detail.answers")}>
              <AnswersForm
                applicationId={application.id}
                questions={fields}
                answers={answers}
                labels={answersLabels(t, localePath(locale, "profile"))}
              />
            </Panel>
          ) : null}

          {draft && !legacy ? (
            <Panel
              id="review"
              title={t("detail.review.title")}
              description={t("detail.review.description")}
            >
              <ProfileSummary
                rows={rows}
                change={{
                  href: navHref("profile"),
                  label: t("detail.review.change"),
                }}
              />

              <div className="mt-6 border-t border-border pt-6">
                {readiness.ready ? (
                  <ReviewSubmitForm
                    applicationId={application.id}
                    labels={{
                      confirm: t("detail.review.confirm"),
                      confirmRequired: t("detail.review.confirmRequired"),
                      submit: t("form.submit"),
                      submitting: t("form.submitting"),
                      errors: {
                        profileRequired: t("form.errors.profileRequired"),
                        profileIncomplete: t("form.errors.profileIncomplete"),
                        opportunityUnavailable: t("form.errors.opportunityUnavailable"),
                        applicationNotEditable: t("form.errors.applicationNotEditable"),
                      },
                      fallback: t("form.errors.fallback"),
                      profileLink: {
                        href: localePath(locale, "profile"),
                        label: t("form.errors.profileLink"),
                      },
                    }}
                  />
                ) : (
                  <div className="flex flex-col gap-3">
                    <ActionStatus tone="info">
                      {t("gate.body", {
                        fields: readiness.missing
                          .map((field) => t(`gate.fields.${field}`))
                          .join(", "),
                      })}
                    </ActionStatus>
                    <div>
                      <Link
                        href={navHref("profile")}
                        className={buttonClass({ size: "sm" })}
                      >
                        {t("gate.action")}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </Panel>
          ) : null}

          {!draft && application.answers.length > 0 ? (
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

          {application.reviewerNote ? (
            <Panel id="reviewer-note" title={t("detail.reviewerNote")}>
              <p className="leading-relaxed whitespace-pre-line text-ink">
                {application.reviewerNote}
              </p>
            </Panel>
          ) : null}

          {accepted ? (
            <Panel
              id="event"
              title={t("detail.event.title")}
              description={t("detail.event.description")}
            >
              <OpportunityFacts opportunity={application.opportunity} now={now} />
            </Panel>
          ) : null}

          {accepted ? (
            <Panel id="attendance" title={t("detail.attendance.title")}>
              {resolved ? (
                <>
                  <p className="font-semibold text-ink">
                    {recordT(`outcomes.${application.attendance?.outcome}`)}
                  </p>
                  {application.attendance?.confirmedHours === undefined ? null : (
                    <p className="tabular mt-1 text-sm text-ink-muted">
                      {t("detail.attendance.hours", {
                        hours: application.attendance.confirmedHours,
                      })}
                    </p>
                  )}
                  {application.attendance?.resolvedAt ? (
                    <p className="tabular mt-1 text-sm text-ink-muted">
                      {t("detail.attendance.confirmedOn", {
                        date: format.dateTime(
                          new Date(application.attendance.resolvedAt),
                          "day",
                        ),
                      })}
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="leading-relaxed text-ink-muted">
                  {ended
                    ? t("detail.attendance.awaiting")
                    : t("detail.attendance.beforeEvent")}
                </p>
              )}
            </Panel>
          ) : null}

          {!draft ? (
            <Panel
              id="snapshot"
              title={t("detail.fromProfile")}
              description={t("detail.fromProfileHelp")}
            >
              <ProfileSummary rows={rows} />
            </Panel>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Panel id="opportunity" title={opportunitiesT("detail.facts")}>
            <OpportunityFacts opportunity={application.opportunity} now={now} />
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
          </Panel>

          {withdrawable ? (
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
          ) : accepted ? (
            <Panel id="actions">
              <p className="text-sm leading-relaxed text-ink-muted">
                {resolved
                  ? t("detail.withdrawClosedResolved")
                  : t("detail.withdrawClosedStarted")}
              </p>
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
