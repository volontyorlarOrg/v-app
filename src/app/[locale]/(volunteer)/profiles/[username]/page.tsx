import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { LoadErrorPanel, loadErrorLabels } from "@/components/app/load-error";
import {
  ProfileFigureNumber,
  ProfileLinkList,
  ProfileSheet,
  type ProfileFigure,
  type ProfileRow,
} from "@/components/profile/profile-sheet";
import { PublicPageLink } from "@/components/profile/public-page-link";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { settle } from "@/lib/api/load.server";
import { getPublicProfile } from "@/lib/api/public-profile.server";
import { initialsOf } from "@/lib/profile/initials";
import { languageDirectory } from "@/lib/profile/language-directory.server";
import { profileLinks } from "@/lib/profile/links";
import { profileSocialLinks } from "@/lib/profile/social-links";
import { navHref } from "@/lib/routing/routes";
import { publicProfileHref } from "@/lib/seo/origin";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/profiles/[username]">): Promise<Metadata> {
  const { locale, username } = await params;
  const t = await getTranslations({ locale, namespace: "profile.visitor" });
  return { title: t("metaTitle", { name: username }) };
}

export default async function MemberProfilePage({
  params,
}: PageProps<"/[locale]/profiles/[username]">) {
  const { locale, username } = await params;
  setRequestLocale(locale);

  const [loaded, t, common, opportunities, record, format] = await Promise.all([
    settle(() => getPublicProfile(username)),
    getTranslations({ locale, namespace: "profile" }),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "opportunities" }),
    getTranslations({ locale, namespace: "record" }),
    getFormatter({ locale }),
  ]);

  if (loaded.status === "failed") {
    return (
      <>
        <h1 className="sr-only">{t("visitor.unavailable")}</h1>
        <LoadErrorPanel
          failure={loaded.failure}
          labels={loadErrorLabels(common)}
          className="mt-0"
        />
      </>
    );
  }

  const profile = loaded.data;
  if (!profile) notFound();

  const localeValue = locale as Locale;
  const number = (chunks: ReactNode) => <ProfileFigureNumber chunks={chunks} />;
  const figures: ProfileFigure[] =
    profile.stats.attendedEvents + profile.stats.confirmedHours + profile.xp > 0
      ? [
          {
            id: "events",
            content: t.rich("visitor.events", {
              count: profile.stats.attendedEvents,
              value: format.number(profile.stats.attendedEvents),
              n: number,
            }),
          },
          {
            id: "hours",
            content: t.rich("visitor.hours", {
              count: profile.stats.confirmedHours,
              value: format.number(profile.stats.confirmedHours),
              n: number,
            }),
          },
          {
            id: "xp",
            content: t.rich("visitor.xp", {
              value: format.number(profile.xp),
              n: number,
            }),
          },
        ]
      : [];
  const text = (id: string, value: string): ProfileRow | null =>
    value.trim() ? { id, label: t(`sheet.rows.${id}`), value: value.trim() } : null;
  const portfolio = profileLinks(profile.links);
  const publicPage = publicProfileHref(profile.username);
  const joinedOn = new Date(profile.joinedAt);
  const rows = [
    profile.region
      ? {
          id: "region",
          label: t("sheet.rows.region"),
          value: opportunities(`regions.${profile.region}`),
        }
      : null,
    text("city", profile.city),
    text("school", profile.school),
    text("gradeYear", profile.gradeYear),
    text("languages", languageDirectory.format(profile.languages, localeValue)),
    text("phone", profile.phone),
    text("telegram", profile.telegram ? `@${profile.telegram}` : ""),
    portfolio.length > 0
      ? {
          id: "links",
          label: t("sheet.rows.links"),
          value: <ProfileLinkList links={portfolio} />,
        }
      : null,
    publicPage
      ? {
          id: "publicPage",
          label: t("sheet.rows.publicPage"),
          value: (
            <PublicPageLink
              href={publicPage}
              labels={{ copy: t("sheet.copy"), copied: t("sheet.copied") }}
            />
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
    <div>
      <Link
        href={navHref("leaderboard")}
        className="enter-rise inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold text-primary-ink underline-offset-4 hover:underline"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {t("visitor.back")}
      </Link>
      <div className="mt-3">
        <ProfileSheet
          name={profile.displayName}
          initials={initialsOf(profile.displayName)}
          avatarUrl={profile.avatarUrl}
          handle={profile.username}
          level={record(`level.${profile.level}`)}
          bio={profile.bio.trim()}
          socials={profileSocialLinks(profile)}
          figures={figures}
          rows={rows}
          completion={null}
          labels={{
            figures: t("sheet.figures"),
            socials: t("sheet.socials"),
            socialPlatforms: {
              telegram: t("fields.telegram"),
              instagram: t("fields.instagram"),
              linkedin: t("fields.linkedin"),
            },
          }}
        />
      </div>
    </div>
  );
}
