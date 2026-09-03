import { ArrowLeft } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Panel } from "@/components/app/panel";
import { PageHeader } from "@/components/app/page-header";
import { PreviewNote } from "@/components/app/preview-note";
import { ApplicationTimeline } from "@/components/applications/application-timeline";
import { ApplicationStatusChip } from "@/components/dashboard/application-status";
import { OpportunityFacts } from "@/components/opportunities/opportunity-facts";
import { buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import {
  isEditable,
  isWithdrawable,
  type ApplicationDetail,
} from "@/lib/applications/status";
import { localized } from "@/lib/opportunities/types";
import { navHref, opportunityHref } from "@/lib/routing/routes";
import { sampleApplication, sampleVolunteer } from "@/lib/sample/volunteer";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/applications/[id]">): Promise<Metadata> {
  const { locale, id } = await params;
  const application = sampleApplication(id);
  return application
    ? { title: localized(application.opportunity.title, locale as Locale) }
    : {};
}

export default async function ApplicationPage({
  params,
}: PageProps<"/[locale]/applications/[id]">) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const now = new Date();
  const application = sampleApplication(id, now);
  if (!application) notFound();

  return <Application application={application} now={now} />;
}

function Application({
  application,
  now,
}: {
  application: ApplicationDetail;
  now: Date;
}) {
  const t = useTranslations("applications");
  const profileT = useTranslations("profile");
  const opportunitiesT = useTranslations("opportunities");
  const common = useTranslations("common");
  const locale = useLocale() as Locale;
  const volunteer = sampleVolunteer(now);

  const snapshot = [
    {
      key: "fullName",
      label: profileT("fields.fullName"),
      value: volunteer.profile.fullName,
    },
    {
      key: "region",
      label: profileT("fields.region"),
      value: volunteer.profile.region
        ? opportunitiesT(`regions.${volunteer.profile.region}`)
        : "—",
    },
    {
      key: "school",
      label: profileT("fields.school"),
      value: volunteer.profile.school || "—",
    },
    {
      key: "contact",
      label: profileT("fields.contact"),
      value: volunteer.profile.telegram
        ? `@${volunteer.profile.telegram}`
        : volunteer.profile.phone || "—",
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
        eyebrow={t("detail.eyebrow")}
        chip={common("sample.chip")}
        title={localized(application.opportunity.title, locale)}
        description={localized(application.opportunity.organization.name, locale)}
        actions={<ApplicationStatusChip status={application.status} />}
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <Panel id="timeline" title={t("detail.timeline")}>
            <ApplicationTimeline application={application} />
          </Panel>

          <Panel id="answers" title={t("detail.answers")}>
            {application.opportunity.title && application.answers.length === 0 ? (
              <p className="text-sm text-ink-muted">
                {application.status === "draft"
                  ? t("detail.answersEmpty")
                  : t("detail.noQuestions")}
              </p>
            ) : (
              <dl className="flex flex-col gap-5">
                {application.answers.map((answer) => (
                  <div key={answer.prompt.en}>
                    <dt className="font-semibold text-ink">
                      {localized(answer.prompt, locale)}
                    </dt>
                    <dd className="mt-1.5 leading-relaxed text-ink-muted">
                      {localized(answer.value, locale)}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </Panel>

          <Panel
            id="snapshot"
            title={t("detail.fromProfile")}
            description={t("detail.fromProfileHelp")}
          >
            <dl className="grid gap-4 sm:grid-cols-2">
              {snapshot.map((item) => (
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

          {isEditable(application.status) || isWithdrawable(application.status) ? (
            <Panel id="actions">
              <button
                type="button"
                disabled
                className={buttonClass({
                  variant: isEditable(application.status) ? "primary" : "outline",
                  className: "w-full",
                })}
              >
                {isEditable(application.status)
                  ? t("continueDraft")
                  : t("detail.withdraw")}
              </button>
              <PreviewNote
                chip={common("preview.chip")}
                body={
                  isEditable(application.status)
                    ? t("detail.continuePreview")
                    : t("detail.withdrawPreview")
                }
                className="mt-4"
              />
            </Panel>
          ) : null}
        </div>
      </div>
    </>
  );
}
