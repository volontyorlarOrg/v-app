import type { ReactNode } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import {
  LoadErrorPanel,
  LoadErrorRows,
  loadErrorLabels,
  type LoadErrorLabels,
} from "@/components/app/load-error";
import {
  ProfileFigureNumber,
  ProfileLinkList,
  ProfileSheet,
  type ProfileFigure,
  type ProfileRow,
} from "@/components/profile/profile-sheet";
import { PublicPageLink } from "@/components/profile/public-page-link";
import { PastEventsSection } from "@/components/profile/past-events-section";
import { Link } from "@/i18n/navigation";
import { getMe } from "@/lib/api/account.server";
import { settle, type LoadFailure, type Loaded } from "@/lib/api/load.server";
import type { History } from "@/lib/api/schemas";
import { getProfile } from "@/lib/api/profile.server";
import { getHistory, getRecord } from "@/lib/api/record.server";
import { requireSession } from "@/lib/api/session.server";
import type { Locale } from "@/i18n/routing";
import {
  EMPTY_PROFILE,
  profileCompletion,
  type VolunteerProfile,
} from "@/lib/profile/completion";
import { initialsOf } from "@/lib/profile/initials";
import { profileLinks } from "@/lib/profile/links";
import { profileSocialLinks } from "@/lib/profile/social-links";
import { languageDirectory } from "@/lib/profile/language-directory.server";
import {
  hasParticipation,
  isReliabilityMeaningful,
  reliabilityPercent,
  type VolunteerRecord,
} from "@/lib/record/levels";
import { navHref } from "@/lib/routing/routes";
import { publicProfileHref } from "@/lib/seo/origin";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/profile">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "profile" });
  return { title: t("metaTitle") };
}

export default async function ProfilePage({ params }: PageProps<"/[locale]/profile">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [session, profile, me, volunteerRecord, history, common] = await Promise.all([
    requireSession(),
    settle(() => getProfile()),
    getMe(),
    getRecord(),
    settle(() => getHistory()),
    getTranslations({ locale, namespace: "common" }),
  ]);

  if (profile.status === "failed") {
    return (
      <ProfileUnavailable failure={profile.failure} labels={loadErrorLabels(common)} />
    );
  }

  const values: VolunteerProfile = profile.data ?? {
    ...EMPTY_PROFILE,
    fullName: me.displayName?.trim() || session.displayName?.trim() || "",
  };

  return (
    <Profile
      values={values}
      record={volunteerRecord}
      handle={me.username}
      avatarUrl={me.avatarUrl}
      publicPage={publicPage(me.username, me.publicProfileEnabled)}
      joinedAt={me.createdAt}
      history={history}
      errorLabels={loadErrorLabels(common)}
    />
  );
}

type PublicPage = { state: "shown"; href: string } | { state: "hidden" } | null;

function publicPage(username: string | null, enabled: boolean): PublicPage {
  const href = username ? publicProfileHref(username) : null;
  if (!href) return null;
  return enabled ? { state: "shown", href } : { state: "hidden" };
}

function ProfileUnavailable({
  failure,
  labels,
}: {
  failure: LoadFailure;
  labels: LoadErrorLabels;
}) {
  const t = useTranslations("profile");

  return (
    <>
      <h1 className="sr-only">{t("metaTitle")}</h1>
      <LoadErrorPanel failure={failure} labels={labels} className="mt-0" />
    </>
  );
}

function Profile({
  values,
  record,
  handle,
  avatarUrl,
  publicPage,
  joinedAt,
  history,
  errorLabels,
}: {
  values: VolunteerProfile;
  record: VolunteerRecord;
  handle: string | null;
  avatarUrl?: string;
  publicPage: PublicPage;
  joinedAt: string;
  history: Loaded<History>;
  errorLabels: LoadErrorLabels;
}) {
  const t = useTranslations("profile");
  const common = useTranslations("common");
  const dashboard = useTranslations("dashboard.profile");
  const opportunities = useTranslations("opportunities");
  const recordLabels = useTranslations("record");
  const format = useFormatter();
  const locale = useLocale() as Locale;

  const completion = profileCompletion(values);
  const name = values.fullName.trim() || common("volunteer");
  const joinedOn = new Date(joinedAt);
  const percent = reliabilityPercent(record.counts);
  const number = (chunks: ReactNode) => <ProfileFigureNumber chunks={chunks} />;

  const figures: ProfileFigure[] = hasParticipation(record)
    ? [
        {
          id: "events",
          content: t.rich("sheet.events", {
            count: record.counts.attended,
            value: format.number(record.counts.attended),
            n: number,
          }),
        },
        ...(record.hours === undefined
          ? []
          : [
              {
                id: "hours",
                content: t.rich("sheet.hours", {
                  count: record.hours,
                  value: format.number(record.hours),
                  n: number,
                }),
              },
            ]),
        ...(isReliabilityMeaningful(record.counts) && percent !== null
          ? [
              {
                id: "reliability",
                content: t.rich("sheet.reliability", {
                  value: format.number(percent / 100, { style: "percent" }),
                  n: number,
                }),
              },
            ]
          : []),
      ]
    : [];

  const text = (id: string, value: string): ProfileRow | null =>
    value.trim() ? { id, label: t(`sheet.rows.${id}`), value: value.trim() } : null;
  const languages = languageDirectory.format(values.languages, locale);
  const links = profileLinks(values.links);
  const socials = profileSocialLinks(values);

  const rows = [
    values.region
      ? {
          id: "region",
          label: t("sheet.rows.region"),
          value: opportunities(`regions.${values.region}`),
        }
      : null,
    text("city", values.city),
    text("school", values.school),
    text("gradeYear", values.gradeYear),
    text("languages", languages),
    text("phone", values.phone),
    text("telegram", values.telegram.trim() ? `@${values.telegram.trim()}` : ""),
    links.length > 0
      ? {
          id: "links",
          label: t("sheet.rows.links"),
          value: <ProfileLinkList links={links} />,
        }
      : null,
    publicPage
      ? {
          id: "publicPage",
          label: t("sheet.rows.publicPage"),
          value:
            publicPage.state === "shown" ? (
              <PublicPageLink
                href={publicPage.href}
                labels={{ copy: t("sheet.copy"), copied: t("sheet.copied") }}
              />
            ) : (
              <span className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-ink-muted">{t("sheet.publicHidden")}</span>
                <Link
                  href={`${navHref("settings")}#privacy`}
                  className="font-semibold text-primary-ink underline-offset-4 hover:underline"
                >
                  {t("sheet.publicShow")}
                </Link>
              </span>
            ),
        }
      : null,
    Number.isNaN(joinedOn.getTime())
      ? null
      : {
          id: "joined",
          label: t("sheet.rows.joined"),
          value: format.dateTime(joinedOn, "monthYear"),
        },
  ].filter((row): row is ProfileRow => row !== null);

  return (
    <ProfileSheet
      name={name}
      initials={initialsOf(name)}
      avatarUrl={avatarUrl}
      handle={handle}
      level={recordLabels(`level.${record.level}`)}
      bio={values.bio.trim()}
      socials={socials}
      figures={figures}
      rows={rows}
      pastEvents={
        history.status === "failed" ? (
          <div className="border-t border-border px-5 py-5 sm:px-8">
            <LoadErrorRows failure={history.failure} labels={errorLabels} />
          </div>
        ) : (
          <PastEventsSection
            events={history.data.items
              .filter((entry) => entry.source === "manual")
              .map((entry) => ({
                id: entry.id,
                title: entry.opportunityTitle,
                organization: entry.organization,
                eventDate: entry.eventDate,
                hours: entry.hours ?? 0,
                xpAwarded: entry.xpAwarded ?? 0,
                countsTowardProgress: entry.countsTowardProgress ?? false,
              }))}
          />
        )
      }
      completion={
        completion.complete
          ? null
          : {
              percent: completion.percent,
              value: t("completion.value", { percent: completion.percent }),
              missing: t("completion.missing", {
                fields: completion.missing
                  .map((field) => t(`completionFields.${field}`))
                  .join(", "),
              }),
              label: t("completion.label"),
            }
      }
      labels={{
        action: completion.complete ? t("sheet.edit") : dashboard("cta"),
        figures: t("sheet.figures"),
        socials: t("sheet.socials"),
        socialPlatforms: {
          telegram: t("fields.telegram"),
          instagram: t("fields.instagram"),
          linkedin: t("fields.linkedin"),
        },
      }}
    />
  );
}
