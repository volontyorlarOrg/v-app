import { useFormatter, useLocale, useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import {
  LoadErrorPanel,
  loadErrorLabels,
  type LoadErrorLabels,
} from "@/components/app/load-error";
import { Panel } from "@/components/app/panel";
import { ProfileMeter } from "@/components/dashboard/profile-meter";
import {
  ProfileIdentity,
  type IdentityFact,
  type IdentityStat,
} from "@/components/profile/profile-identity";
import { getMe } from "@/lib/api/account.server";
import { settle, type LoadFailure } from "@/lib/api/load.server";
import { getProfile } from "@/lib/api/profile.server";
import { getRecord } from "@/lib/api/record.server";
import { requireSession } from "@/lib/api/session.server";
import type { Locale } from "@/i18n/routing";
import {
  EMPTY_PROFILE,
  profileCompletion,
  type VolunteerProfile,
} from "@/lib/profile/completion";
import { initialsOf } from "@/lib/profile/initials";
import { profileLinks } from "@/lib/profile/links";
import { languageDirectory } from "@/lib/profile/language-directory.server";
import {
  hasParticipation,
  isReliabilityMeaningful,
  reliabilityPercent,
  type VolunteerRecord,
} from "@/lib/record/levels";
import { cn } from "@/lib/utils";
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

  const [session, profile, me, volunteerRecord, common] = await Promise.all([
    requireSession(),
    settle(() => getProfile()),
    getMe(),
    getRecord(),
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
      publicHref={me.publicProfileEnabled ? publicProfileHref(me.username) : null}
      joinedAt={me.createdAt}
    />
  );
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
  publicHref,
  joinedAt,
}: {
  values: VolunteerProfile;
  record: VolunteerRecord;
  handle: string | null;
  avatarUrl?: string;
  publicHref: string | null;
  joinedAt: string;
}) {
  const t = useTranslations("profile");
  const common = useTranslations("common");
  const opportunities = useTranslations("opportunities");
  const recordLabels = useTranslations("record");
  const format = useFormatter();
  const locale = useLocale() as Locale;

  const completion = profileCompletion(values);
  const joinedOn = new Date(joinedAt);
  const name = values.fullName.trim() || common("volunteer");
  const initials = initialsOf(name);
  const percent = reliabilityPercent(record.counts);
  const meaningful = isReliabilityMeaningful(record.counts);

  const stats: IdentityStat[] = hasParticipation(record)
    ? [
        {
          id: "events",
          label: t("stats.events"),
          value: format.number(record.counts.attended),
        },
        ...(meaningful && percent !== null
          ? [{ id: "reliability", label: t("stats.reliability"), value: `${percent}%` }]
          : []),
        ...(record.hours === undefined
          ? []
          : [
              {
                id: "hours",
                label: t("stats.hours"),
                value: format.number(record.hours),
              },
            ]),
      ]
    : [];

  const facts: IdentityFact[] = [
    { id: "education" as const, value: join([values.school, values.gradeYear]) },
    {
      id: "place" as const,
      value: join([
        values.region ? opportunities(`regions.${values.region}`) : "",
        values.city,
      ]),
    },
    {
      id: "languages" as const,
      value: languageDirectory.format(values.languages, locale),
    },
  ].filter((fact) => fact.value.length > 0);

  const contact = [
    { id: "phone", label: t("fields.phone"), value: values.phone.trim() },
    {
      id: "telegram",
      label: t("fields.telegram"),
      value: values.telegram.trim() ? `@${values.telegram.trim()}` : "",
    },
  ].filter((row) => row.value.length > 0);

  const contactPanel =
    contact.length === 0 ? null : (
      <Panel
        id="contact"
        title={t("overview.contactTitle")}
        description={t("overview.contactHelp")}
        padding="none"
        className="enter-rise order-2 [--enter-delay:120ms] xl:order-1"
      >
        <dl>
          {contact.map((row) => (
            <div
              key={row.id}
              className="flex flex-col gap-1 border-t border-border px-5 py-4 first:border-t-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <dt className="text-sm font-semibold text-ink">{row.label}</dt>
              <dd className="tabular text-sm text-ink">{row.value}</dd>
            </div>
          ))}
        </dl>
      </Panel>
    );

  return (
    <div className="flex flex-col gap-6">
      <ProfileIdentity
        name={name}
        initials={initials}
        avatarUrl={avatarUrl}
        handle={handle}
        publicHref={publicHref}
        stats={stats}
        bio={values.bio}
        facts={facts}
        links={profileLinks(values.links)}
        complete={completion.complete}
        labels={{
          level: recordLabels(`level.${record.level}`),
          complete: t("identity.complete"),
          joined: Number.isNaN(joinedOn.getTime())
            ? null
            : t("identity.joined", {
                date: format.dateTime(joinedOn, "monthYear"),
              }),
          bioEmpty: t("identity.bioEmpty"),
          edit: t("identity.edit"),
          record: recordLabels("history.title"),
          publicProfile: t("identity.publicProfile"),
        }}
      />

      {completion.complete ? (
        contactPanel
      ) : (
        <div
          className={cn(
            "grid gap-6",
            contactPanel && "xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start",
          )}
        >
          {contactPanel}
          <Panel
            id="completeness"
            className="enter-rise order-1 [--enter-delay:60ms] xl:sticky xl:top-8 xl:order-2"
          >
            <ProfileMeter completion={completion} />
          </Panel>
        </div>
      )}
    </div>
  );
}

function join(parts: readonly string[]): string {
  return parts
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}
