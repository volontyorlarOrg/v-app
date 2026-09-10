import { useFormatter, useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import { ProfileForm } from "@/components/profile/profile-form";
import {
  ProfileIdentity,
  type IdentityFact,
  type IdentityStat,
} from "@/components/profile/profile-identity";
import { getMe } from "@/lib/api/account.server";
import { getProfile } from "@/lib/api/profile.server";
import { getRecord } from "@/lib/api/record.server";
import { requireSession } from "@/lib/api/session.server";
import { REGIONS } from "@/lib/opportunities/types";
import {
  EMPTY_PROFILE,
  profileCompletion,
  type VolunteerProfile,
} from "@/lib/profile/completion";
import { profileLinks } from "@/lib/profile/links";
import {
  isReliabilityMeaningful,
  levelFor,
  reliabilityPercent,
  type VolunteerRecord,
} from "@/lib/record/levels";

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

  const [session, profile, me, volunteerRecord] = await Promise.all([
    requireSession(),
    getProfile(),
    getMe(),
    getRecord(),
  ]);

  const values: VolunteerProfile = profile ?? {
    ...EMPTY_PROFILE,
    fullName: me.displayName?.trim() || session.displayName?.trim() || "",
  };

  return (
    <Profile
      values={values}
      record={volunteerRecord}
      handle={me.telegramIdentity?.username?.trim() || null}
      joinedAt={me.createdAt}
    />
  );
}

function Profile({
  values,
  record,
  handle,
  joinedAt,
}: {
  values: VolunteerProfile;
  record: VolunteerRecord;
  handle: string | null;
  joinedAt: string;
}) {
  const t = useTranslations("profile");
  const common = useTranslations("common");
  const opportunities = useTranslations("opportunities");
  const recordLabels = useTranslations("record");
  const format = useFormatter();

  const completion = profileCompletion(values);
  const joinedOn = new Date(joinedAt);
  const name = values.fullName.trim() || common("volunteer");
  const initials = initialsOf(name);
  const percent = reliabilityPercent(record.counts);
  const meaningful = isReliabilityMeaningful(record.counts);

  const stats: IdentityStat[] = [
    {
      id: "events",
      label: t("stats.events"),
      value: format.number(record.counts.attended),
    },
    {
      id: "reliability",
      label: t("stats.reliability"),
      value: meaningful && percent !== null ? `${percent}%` : "—",
    },
    {
      id: "hours",
      label: t("stats.hours"),
      value: record.hours === undefined ? "—" : format.number(record.hours),
    },
  ];

  const facts: IdentityFact[] = [
    { id: "education" as const, value: join([values.school, values.gradeYear]) },
    {
      id: "place" as const,
      value: join([
        values.region ? opportunities(`regions.${values.region}`) : "",
        values.city,
      ]),
    },
    { id: "languages" as const, value: join(values.languages) },
  ].filter((fact) => fact.value.length > 0);

  const fieldKeys = [
    "fullName",
    "bio",
    "bioHelp",
    "school",
    "gradeYear",
    "region",
    "regionAny",
    "city",
    "languages",
    "languagesHelp",
    "phone",
    "phoneHelp",
    "telegram",
    "telegramHelp",
    "links",
    "linksHelp",
  ] as const;
  const sectionKeys = ["education", "location", "contact", "links"] as const;

  return (
    <div className="flex flex-col gap-6">
      <ProfileIdentity
        name={name}
        initials={initials}
        handle={handle}
        stats={stats}
        bio={values.bio}
        facts={facts}
        links={profileLinks(values.links)}
        completion={completion}
        labels={{
          level: recordLabels(`level.${levelFor(record.counts)}`),
          complete: t("identity.complete"),
          joined: Number.isNaN(joinedOn.getTime())
            ? null
            : t("identity.joined", {
                date: format.dateTime(joinedOn, "monthYear"),
              }),
          bioEmpty: t("identity.bioEmpty"),
          edit: t("identity.edit"),
          record: t("identity.record"),
          completion: {
            label: t("completion.label"),
            value: t("completion.value", { percent: completion.percent }),
            missing: t("completion.missing", {
              fields: completion.missing
                .map((field) => t(`completionFields.${field}`))
                .join(", "),
            }),
          },
        }}
      />

      <ProfileForm
        values={values}
        regions={REGIONS.map((region) => ({
          value: region,
          label: opportunities(`regions.${region}`),
        }))}
        labels={{
          title: t("form.title"),
          description: t("form.description"),
          sections: Object.fromEntries(
            sectionKeys.map((key) => [key, t(`sections.${key}`)]),
          ) as Record<(typeof sectionKeys)[number], string>,
          fields: Object.fromEntries(
            fieldKeys.map((key) => [key, t(`fields.${key}`)]),
          ) as Record<(typeof fieldKeys)[number], string>,
          optional: t("optional"),
          save: t("save"),
          saving: t("saving"),
          saved: t("saved"),
          saveError: t("saveError"),
          fieldInvalid: t("fieldInvalid"),
        }}
      />
    </div>
  );
}

function join(parts: readonly string[]): string {
  return parts
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts
    .map((part) => [...part][0] ?? "")
    .join("")
    .toLocaleUpperCase();
}
