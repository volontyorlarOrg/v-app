import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import {
  LoadErrorRows,
  loadErrorLabels,
  type LoadErrorLabels,
} from "@/components/app/load-error";
import { Panel } from "@/components/app/panel";
import { CheckpointsPanel } from "@/components/checkpoints/checkpoints-panel";
import {
  ConnectTelegram,
  type ConnectTelegramLabels,
} from "@/components/dashboard/connect-telegram";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { GettingStarted } from "@/components/dashboard/getting-started";
import { NextUp } from "@/components/dashboard/next-up";
import { ProgressFigures } from "@/components/dashboard/progress-figures";
import {
  OnboardingResume,
  type OnboardingResumeLabels,
} from "@/components/onboarding/onboarding-resume";
import { ParticipationTable } from "@/components/record/participation-table";
import type { Locale } from "@/i18n/routing";
import { connectStartHref } from "@/lib/account/connections";
import { getMe } from "@/lib/api/account.server";
import { listApplications } from "@/lib/api/applications.server";
import { getCheckpoints } from "@/lib/api/checkpoints.server";
import { settle, type Loaded } from "@/lib/api/load.server";
import { getProfile } from "@/lib/api/profile.server";
import { getHistory, getProgress } from "@/lib/api/record.server";
import type {
  ApplicationList,
  CheckpointList,
  History,
  Me,
  Progress,
} from "@/lib/api/schemas";
import { requireSession } from "@/lib/api/session.server";
import { isUpcomingCommitment } from "@/lib/applications/status";
import { pageOfRank, VIEWER_ANCHOR } from "@/lib/leaderboard/standing";
import { leaderboardPageHref } from "@/lib/leaderboard/search-params";
import { serializeOnboardingState } from "@/lib/onboarding/state";
import { readOnboardingState } from "@/lib/onboarding/state.server";
import { FORM_STEPS, FORM_STEP_COUNT, type FormStep } from "@/lib/onboarding/steps";
import { initialsOf } from "@/lib/profile/initials";
import { recentParticipation } from "@/lib/record/participation";
import { navHref } from "@/lib/routing/routes";

export const dynamic = "force-dynamic";

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
    me,
    progress,
    history,
    applications,
    onboarding,
    common,
    checkpoints,
  ] = await Promise.all([
    requireSession(),
    settle(() => getProfile()),
    settle(() => getMe()),
    settle(() => getProgress()),
    settle(() => getHistory()),
    settle(() => listApplications()),
    readOnboardingState(),
    getTranslations({ locale, namespace: "common" }),
    settle(() => getCheckpoints()),
  ]);
  const loadedMe = me.status === "loaded" ? me.data : null;
  const personName =
    (profile.status === "loaded" ? profile.data?.fullName.trim() : "") ||
    loadedMe?.displayName?.trim() ||
    session.displayName?.trim() ||
    "";

  return (
    <Dashboard
      locale={locale as Locale}
      personName={personName}
      fallbackName={common("volunteer")}
      me={loadedMe}
      progress={progress}
      history={history}
      applications={applications}
      onboardingState={onboarding && serializeOnboardingState(onboarding)}
      checkpoints={checkpoints}
      errorLabels={loadErrorLabels(common)}
    />
  );
}

function Dashboard({
  locale,
  personName,
  fallbackName,
  me,
  progress,
  history,
  applications: loadedApplications,
  onboardingState,
  checkpoints,
  errorLabels,
}: {
  locale: Locale;
  personName: string;
  fallbackName: string;
  me: Me | null;
  progress: Loaded<Progress>;
  history: Loaded<History>;
  applications: Loaded<ApplicationList>;
  onboardingState: string | null;
  checkpoints: Loaded<CheckpointList>;
  errorLabels: LoadErrorLabels;
}) {
  const t = useTranslations("dashboard");
  const onboarding = useTranslations("onboarding");

  const now = new Date();
  const firstName = personName.split(/\s+/)[0] ?? "";
  const passName = personName || fallbackName;

  const all =
    loadedApplications.status === "loaded" ? loadedApplications.data.items : [];
  const commitments = all
    .filter((application) => isUpcomingCommitment(application, now))
    .sort(
      (a, b) =>
        new Date(a.opportunity.startsAt).getTime() -
        new Date(b.opportunity.startsAt).getTime(),
    );
  const recent =
    history.status === "loaded" ? recentParticipation(history.data.items, now) : [];

  const fresh =
    loadedApplications.status === "loaded" &&
    all.length === 0 &&
    history.status === "loaded" &&
    history.data.items.length === 0;
  const showNextUp = loadedApplications.status === "failed" || commitments.length > 0;
  const showParticipation = history.status === "failed" || recent.length > 0;

  const rank = progress.status === "loaded" ? progress.data.rank : null;
  const leaderboard = navHref("leaderboard");

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
      <DashboardHero
        greeting={
          firstName ? t("greeting", { name: firstName }) : t("greetingAnonymous")
        }
        progress={progress}
        holder={{
          name: passName,
          initials: initialsOf(passName),
          ...(me?.avatarUrl ? { avatarUrl: me.avatarUrl } : {}),
        }}
        errorLabels={errorLabels}
      />

      <OnboardingResume serverState={onboardingState} labels={resumeLabels} />

      {me?.authMethods.telegram === false ? (
        <ConnectTelegram
          href={connectStartHref("telegram", locale)}
          labels={telegramLabels}
        />
      ) : null}

      <ProgressFigures
        progress={progress}
        links={{
          hours: navHref("record"),
          xp: leaderboard,
          rank:
            rank === null
              ? leaderboard
              : `${leaderboardPageHref(leaderboard, pageOfRank(rank))}#${VIEWER_ANCHOR}`,
        }}
        errorLabels={errorLabels}
        className="mt-6"
      />

      {showNextUp ? (
        <Panel
          id="next-up"
          title={t("nextUp.title")}
          description={t("nextUp.description")}
          padding="none"
          className="mt-6"
        >
          {loadedApplications.status === "failed" ? (
            <LoadErrorRows failure={loadedApplications.failure} labels={errorLabels} />
          ) : (
            <NextUp commitments={commitments} />
          )}
        </Panel>
      ) : null}

      <CheckpointsPanel
        checkpoints={checkpoints}
        errorLabels={errorLabels}
        className="mt-6"
      />

      {fresh ? (
        <GettingStarted id="getting-started" className="mt-6" />
      ) : showParticipation ? (
        <Panel
          id="participation"
          title={t("participation.title")}
          action={{ href: navHref("record"), label: t("participation.viewAll") }}
          padding="none"
          className="mt-6"
        >
          {history.status === "failed" ? (
            <LoadErrorRows failure={history.failure} labels={errorLabels} />
          ) : (
            <ParticipationTable
              entries={recent}
              now={now}
              label={t("participation.title")}
            />
          )}
        </Panel>
      ) : null}
    </>
  );
}
