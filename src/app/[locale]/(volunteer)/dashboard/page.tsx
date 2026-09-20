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
import { GettingStarted } from "@/components/dashboard/getting-started";
import { NextUp } from "@/components/dashboard/next-up";
import { VolunteerPassBadge } from "@/components/onboarding/volunteer-pass-badge";
import {
  OnboardingResume,
  type OnboardingResumeLabels,
} from "@/components/onboarding/onboarding-resume";
import { HeroCell } from "@/components/dashboard/hero-cell";
import { ProfileMeterSummary } from "@/components/dashboard/profile-meter";
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
import {
  FORM_STEPS,
  FORM_STEP_COUNT,
  passParts,
  type FormStep,
} from "@/lib/onboarding/steps";
import { EMPTY_PROFILE, profileCompletion } from "@/lib/profile/completion";
import {
  LEVEL_THRESHOLDS,
  hasParticipation,
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
  const profileT = useTranslations("profile");
  const format = useFormatter();

  const now = new Date();
  const progress = levelProgress(volunteerRecord.counts, volunteerRecord.level);
  const percent = reliabilityPercent(volunteerRecord.counts);
  const meaningful = isReliabilityMeaningful(volunteerRecord.counts);
  const completion =
    profile.status === "loaded"
      ? profileCompletion(profile.data ?? EMPTY_PROFILE)
      : null;
  const profileForPass =
    profile.status === "loaded" ? (profile.data ?? EMPTY_PROFILE) : EMPTY_PROFILE;
  const badgeParts = passParts(
    profileForPass,
    completion?.complete ? "done" : "contact",
  );
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

  const historyCount = history.status === "loaded" ? history.data.items.length : null;
  const fresh =
    loadedApplications.status === "loaded" && all.length === 0 && historyCount === 0;
  const showNextUp = loadedApplications.status === "failed" || commitments.length > 0;
  const showHistory = historyCount !== 0;

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
        <div className="dashboard-hero-intro">
          <PageHeader
            title={
              firstName ? t("greeting", { name: firstName }) : t("greetingAnonymous")
            }
            description={lead}
            className="sm:flex-col sm:items-start sm:justify-start"
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
        <div className="dashboard-pass" aria-hidden="true">
          <VolunteerPassBadge parts={badgeParts} />
        </div>
        <div id="progress" className="dashboard-hero-band scroll-mt-20">
          <HeroCell
            id="dashboard-progress"
            title={t("progress.title")}
            action={{ href: navHref("leaderboard"), label: t("progress.leaderboard") }}
          >
            <RecordProgress record={volunteerRecord} />
          </HeroCell>
          <HeroCell
            id="dashboard-profile"
            title={profileT("completion.label")}
            action={{
              href: navHref("profileEdit"),
              label: completion?.complete ? t("profile.edit") : t("profile.cta"),
            }}
          >
            {completion ? (
              <ProfileMeterSummary completion={completion} />
            ) : profile.status === "failed" ? (
              <LoadErrorRows
                failure={profile.failure}
                labels={errorLabels}
                className="dashboard-hero-meter px-0 py-2"
              />
            ) : null}
          </HeroCell>
        </div>
      </section>

      <OnboardingResume serverState={onboardingState} labels={resumeLabels} />

      {telegramConnected === false ? (
        <ConnectTelegram
          href={connectStartHref("telegram", locale)}
          labels={telegramLabels}
        />
      ) : null}

      {hasParticipation(volunteerRecord) ? (
        <StatTiles stats={stats} className="mt-6" />
      ) : null}

      {fresh ? (
        <GettingStarted id={HISTORY_ANCHOR} className="mt-6 scroll-mt-20" />
      ) : (
        <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-2">
          {showNextUp ? (
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
          ) : null}

          <Panel
            id="applications"
            title={t("applications.title")}
            action={{ href: navHref("applications"), label: t("applications.viewAll") }}
            padding="none"
            className={showNextUp ? undefined : "xl:col-span-2"}
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

          {showHistory ? (
            <Panel
              id={HISTORY_ANCHOR}
              title={record("history.title")}
              description={record("history.description")}
              padding="none"
              className="scroll-mt-20 xl:col-span-2"
            >
              {history.status === "failed" ? (
                <LoadErrorRows failure={history.failure} labels={errorLabels} />
              ) : (
                <HistoryTable entries={history.data.items} />
              )}
            </Panel>
          ) : null}
        </div>
      )}
    </>
  );
}
