import { useFormatter, useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import { Panel } from "@/components/app/panel";
import { PageHeader } from "@/components/app/page-header";
import { StatTiles, type Stat } from "@/components/app/stat-tile";
import { ApplicationRows } from "@/components/dashboard/application-rows";
import { ImpactOrbit } from "@/components/dashboard/impact-orbit";
import { NextUp } from "@/components/dashboard/next-up";
import { ProfileMeter } from "@/components/dashboard/profile-meter";
import { RecordProgress } from "@/components/dashboard/record-progress";
import { buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { listApplications } from "@/lib/api/applications.server";
import { getProfile } from "@/lib/api/profile.server";
import { getRecord } from "@/lib/api/record.server";
import { requireSession } from "@/lib/api/session.server";
import {
  isUpcomingCommitment,
  type ApplicationSummary,
} from "@/lib/applications/status";
import {
  EMPTY_PROFILE,
  profileCompletion,
  type VolunteerProfile,
} from "@/lib/profile/completion";
import {
  LEVEL_THRESHOLDS,
  isReliabilityMeaningful,
  levelProgress,
  reliabilityPercent,
  type Level,
  type VolunteerRecord,
} from "@/lib/record/levels";
import { navHref } from "@/lib/routing/routes";

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

  const [session, profile, volunteerRecord, applications] = await Promise.all([
    requireSession(),
    getProfile(),
    getRecord(),
    listApplications(),
  ]);

  return (
    <Dashboard
      displayName={profile?.fullName.trim() || session.displayName?.trim() || ""}
      profile={profile ?? EMPTY_PROFILE}
      record={volunteerRecord}
      applications={applications.items}
    />
  );
}

function Dashboard({
  displayName,
  profile,
  record: volunteerRecord,
  applications: all,
}: {
  displayName: string;
  profile: VolunteerProfile;
  record: VolunteerRecord;
  applications: readonly ApplicationSummary[];
}) {
  const t = useTranslations("dashboard");
  const record = useTranslations("record");
  const applicationsT = useTranslations("applications");
  const format = useFormatter();

  const now = new Date();
  const progress = levelProgress(volunteerRecord.counts);
  const percent = reliabilityPercent(volunteerRecord.counts);
  const meaningful = isReliabilityMeaningful(volunteerRecord.counts);
  const completion = profileCompletion(profile);
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
      note: meaningful ? undefined : t("tiles.reliabilityPending"),
    },
    {
      id: "hours",
      label: t("tiles.hours"),
      value:
        volunteerRecord.hours === undefined ? "—" : format.number(volunteerRecord.hours),
      note: volunteerRecord.hoursVerified ? undefined : t("tiles.hoursUnverified"),
    },
  ];

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

  return (
    <>
      <section className="dashboard-hero">
        <div className="min-w-0 py-1">
          <PageHeader
            title={firstName ? t("greeting", { name: firstName }) : t("greetingAnonymous")}
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

      <StatTiles stats={stats} className="mt-6" />

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <Panel
            id="next-up"
            title={t("nextUp.title")}
            description={t("nextUp.description")}
            padding="none"
          >
            <NextUp commitments={commitments} />
          </Panel>

          <Panel
            id="applications"
            title={t("applications.title")}
            action={{ href: navHref("applications"), label: t("applications.viewAll") }}
            padding="none"
          >
            <ApplicationRows
              applications={applications}
              now={now}
              empty={{
                title: applicationsT("empty.title"),
                body: applicationsT("empty.body"),
              }}
            />
          </Panel>
        </div>

        <div className="min-w-0">
          <Panel
            id="progress"
            title={t("progress.title")}
            description={t("progress.description")}
            action={{ href: navHref("record"), label: t("record.viewAll") }}
          >
            <RecordProgress record={volunteerRecord} />
            <div className="mt-5 border-t border-border pt-5">
              <ProfileMeter completion={completion} />
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
