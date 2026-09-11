import { useFormatter, useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import {
  LoadErrorRows,
  loadErrorLabels,
  type LoadErrorLabels,
} from "@/components/app/load-error";
import { Panel } from "@/components/app/panel";
import { PageHeader } from "@/components/app/page-header";
import { StatTiles, type Stat } from "@/components/app/stat-tile";
import { ApplicationRows } from "@/components/dashboard/application-rows";
import {
  ConnectTelegram,
  type ConnectTelegramLabels,
} from "@/components/dashboard/connect-telegram";
import { ImpactOrbit } from "@/components/dashboard/impact-orbit";
import { NextUp } from "@/components/dashboard/next-up";
import {
  OnboardingResume,
  type OnboardingResumeLabels,
} from "@/components/onboarding/onboarding-resume";
import { ProfileMeter } from "@/components/dashboard/profile-meter";
import { RecordProgress } from "@/components/dashboard/record-progress";
import { HistoryTable } from "@/components/record/history-table";
import { buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { connectStartHref } from "@/lib/account/connections";
import { getMe } from "@/lib/api/account.server";
import { listApplications } from "@/lib/api/applications.server";
import { settle, type Loaded } from "@/lib/api/load.server";
import { getProfile } from "@/lib/api/profile.server";
import { getHistory, getRecord } from "@/lib/api/record.server";
import type { ApplicationList, History, Profile } from "@/lib/api/schemas";
import { requireSession } from "@/lib/api/session.server";
import { isUpcomingCommitment } from "@/lib/applications/status";
import { serializeOnboardingState } from "@/lib/onboarding/state";
import { readOnboardingState } from "@/lib/onboarding/state.server";
import { FORM_STEPS, FORM_STEP_COUNT, type FormStep } from "@/lib/onboarding/steps";
import { EMPTY_PROFILE, profileCompletion } from "@/lib/profile/completion";
import {
  LEVEL_THRESHOLDS,
  isReliabilityMeaningful,
  levelProgress,
  reliabilityPercent,
  type Level,
  type VolunteerRecord,
} from "@/lib/record/levels";
import { HISTORY_ANCHOR, navHref } from "@/lib/routing/routes";

export const dynamic = "force-dynamic";

const APPLICATIONS_SHOWN = 3;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/dashboard">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard" });
  return { title: t("metaTitle") };
}

export default async function DashboardPage({
  params,
}: PageProps<"/[locale]/dashboard">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [
    session,
    profile,
    volunteerRecord,
    history,
    applications,
    onboarding,
    telegram,
    common,
  ] = await Promise.all([
    requireSession(),
    settle(() => getProfile()),
    getRecord(),
    settle(() => getHistory()),
    settle(() => listApplications()),
    readOnboardingState(),
    readTelegramConnection(),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const loadedProfile = profile.status === "loaded" ? profile.data : null;

  return (
    <Dashboard
      locale={locale as Locale}
      displayName={loadedProfile?.fullName.trim() || session.displayName?.trim() || ""}
      profile={profile}
      record={volunteerRecord}
      history={history}
      applications={applications}
      onboardingState={onboarding && serializeOnboardingState(onboarding)}
      telegramConnected={telegram}
      errorLabels={loadErrorLabels(common)}
    />
  );
}

async function readTelegramConnection(): Promise<boolean | null> {
  try {
    return (await getMe()).authMethods.telegram;
  } catch {
    return null;
  }
}

function Dashboard({
  locale,
  displayName,
  profile,
  record: volunteerRecord,
  history,
  applications: loadedApplications,
  onboardingState,
  telegramConnected,
  errorLabels,
}: {
  locale: Locale;
  displayName: string;
  profile: Loaded<Profile | null>;
  record: VolunteerRecord;
  history: Loaded<History>;
  applications: Loaded<ApplicationList>;
  onboardingState: string | null;
  telegramConnected: boolean | null;
  errorLabels: LoadErrorLabels;
}) {
  const t = useTranslations("dashboard");
  const onboarding = useTranslations("onboarding");
  const record = useTranslations("record");
  const applicationsT = useTranslations("applications");
  const format = useFormatter();

  const now = new Date();
  const progress = levelProgress(volunteerRecord.counts);
  const percent = reliabilityPercent(volunteerRecord.counts);
  const meaningful = isReliabilityMeaningful(volunteerRecord.counts);
  const completion =
    profile.status === "loaded"
      ? profileCompletion(profile.data ?? EMPTY_PROFILE)
      : null;
  const levelName = (level: Level) => record(`level.${level}`);
  const firstName = displayName.split(/\s+/)[0] ?? "";

  const lead = progress.next
    ? progress.eventsNeeded !== null
      ? t("levelLead.events", {
          level: levelName(progress.current),
          next: levelName(progress.next),
          events: progress.eventsNeeded,
        })
      : progress.blockedByReview
        ? t("levelLead.review", {
            level: levelName(progress.current),
            next: levelName(progress.next),
          })
        : t("levelLead.reliability", {
            level: levelName(progress.current),
            next: levelName(progress.next),
            percent: Math.round(LEVEL_THRESHOLDS[progress.next].reliability * 100),
          })
    : t("levelLead.top", { level: levelName(progress.current) });

  const stats: Stat[] = [
    {
      id: "events",
      label: t("tiles.events"),
      value: format.number(volunteerRecord.counts.attended),
      achievement: true,
    },
    {
      id: "reliability",
      label: t("tiles.reliability"),
      value: meaningful && percent !== null ? `${percent}%` : "—",
      note: meaningful
        ? record("figures.reliabilityHelp")
        : t("tiles.reliabilityPending"),
      achievement: true,
    },
    {
      id: "hours",
      label: t("tiles.hours"),
      value:
        volunteerRecord.hours === undefined
          ? "—"
          : format.number(volunteerRecord.hours),
      note: volunteerRecord.hoursVerified ? undefined : t("tiles.hoursUnverified"),
      achievement: true,
    },
    {
      id: "awaiting",
      label: record("figures.awaiting"),
      value: format.number(volunteerRecord.counts.acceptedUnconfirmed),
      note: record("figures.awaitingHelp"),
    },
  ];

  const all =
    loadedApplications.status === "loaded" ? loadedApplications.data.items : [];

  const commitments = all
    .filter((application) => isUpcomingCommitment(application, now))
    .sort(
      (a, b) =>
        new Date(a.opportunity.startsAt).getTime() -
        new Date(b.opportunity.startsAt).getTime(),
    );

  const applications = [...all]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, APPLICATIONS_SHOWN);

  const resumeLabels: OnboardingResumeLabels = {
    title: onboarding("resume.title"),
    bodyByDone: Array.from({ length: FORM_STEP_COUNT + 1 }, (_, done) =>
      onboarding("resume.body", { done, total: FORM_STEP_COUNT }),
    ),
    continue: onboarding("resume.continue"),
    dismiss: onboarding("resume.dismiss"),
    rail: onboarding("rail.label"),
    steps: Object.fromEntries(
      FORM_STEPS.map((key) => [key, onboarding(`rail.${key}`)]),
    ) as Record<FormStep, string>,
    states: {
      done: onboarding("railState.done"),
      current: onboarding("railState.current"),
      upcoming: onboarding("railState.upcoming"),
    },
  };

  const telegramLabels: ConnectTelegramLabels = {
    title: t("connectTelegram.title"),
    body: t("connectTelegram.body"),
    connect: t("connectTelegram.connect"),
    handoff: t("connectTelegram.handoff"),
  };

  return (
    <>
      <section className="dashboard-hero">
        <div className="min-w-0 py-1">
          <PageHeader
            title={
              firstName ? t("greeting", { name: firstName }) : t("greetingAnonymous")
            }
            description={lead}
            actions={
              <Link
                href={navHref("opportunities")}
                className={buttonClass({ size: "sm" })}
              >
                {t("browse")}
              </Link>
            }
          />
        </div>
        <ImpactOrbit />
      </section>

      <OnboardingResume serverState={onboardingState} labels={resumeLabels} />

      {telegramConnected === false ? (
        <ConnectTelegram
          href={connectStartHref("telegram", locale)}
          labels={telegramLabels}
        />
      ) : null}

      <StatTiles stats={stats} className="mt-6" />

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <Panel
            id="next-up"
            title={t("nextUp.title")}
            description={t("nextUp.description")}
            padding="none"
          >
            {loadedApplications.status === "failed" ? (
              <LoadErrorRows
                failure={loadedApplications.failure}
                labels={errorLabels}
              />
            ) : (
              <NextUp commitments={commitments} />
            )}
          </Panel>

          <Panel
            id="applications"
            title={t("applications.title")}
            action={{ href: navHref("applications"), label: t("applications.viewAll") }}
            padding="none"
          >
            {loadedApplications.status === "failed" ? (
              <LoadErrorRows
                failure={loadedApplications.failure}
                labels={errorLabels}
              />
            ) : (
              <ApplicationRows
                applications={applications}
                now={now}
                empty={{
                  title: applicationsT("empty.title"),
                  body: applicationsT("empty.body"),
                }}
              />
            )}
          </Panel>

          <Panel
            id={HISTORY_ANCHOR}
            title={record("history.title")}
            description={record("history.description")}
            padding="none"
            className="scroll-mt-20"
          >
            {history.status === "failed" ? (
              <LoadErrorRows failure={history.failure} labels={errorLabels} />
            ) : (
              <HistoryTable entries={history.data.items} />
            )}
          </Panel>
        </div>

        <div className="min-w-0">
          <Panel
            id="progress"
            title={t("progress.title")}
            action={{ href: navHref("leaderboard"), label: t("progress.leaderboard") }}
            className="xl:sticky xl:top-8"
          >
            <RecordProgress record={volunteerRecord} />
            <div className="mt-5 border-t border-border pt-5">
              {completion ? (
                <ProfileMeter completion={completion} />
              ) : profile.status === "failed" ? (
                <LoadErrorRows
                  failure={profile.failure}
                  labels={errorLabels}
                  className="px-0 py-2"
                />
              ) : null}
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
