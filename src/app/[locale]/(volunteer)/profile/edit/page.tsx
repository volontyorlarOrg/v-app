import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import { PageHeader } from "@/components/app/page-header";
import { ProfileForm } from "@/components/profile/profile-form";
import { AvatarEditor } from "@/components/profile/avatar-editor";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getMe } from "@/lib/api/account.server";
import { getProfile } from "@/lib/api/profile.server";
import { requireSession } from "@/lib/api/session.server";
import { REGIONS } from "@/lib/opportunities/types";
import { EMPTY_PROFILE, type VolunteerProfile } from "@/lib/profile/completion";
import { languageDirectory } from "@/lib/profile/language-directory.server";
import { initialsOf } from "@/lib/profile/initials";
import { navHref } from "@/lib/routing/routes";

export const dynamic = "force-dynamic";

const FIELD_KEYS = [
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
  "languagesSearch",
  "languagesEmpty",
  "languagesCommon",
  "languagesAll",
  "languagesRemove",
  "languagesLimit",
  "phone",
  "phoneHelp",
  "telegram",
  "telegramHelp",
  "links",
  "linksHelp",
] as const;

const SECTION_KEYS = ["about", "education", "location", "contact", "links"] as const;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/profile/edit">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "profile" });
  return { title: t("form.title") };
}

export default async function ProfileEditPage({
  params,
}: PageProps<"/[locale]/profile/edit">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [session, profile, me] = await Promise.all([
    requireSession(),
    getProfile(),
    getMe(),
  ]);

  const stored: VolunteerProfile = profile ?? {
    ...EMPTY_PROFILE,
    fullName: me.displayName?.trim() || session.displayName?.trim() || "",
  };
  const values = {
    ...stored,
    languages: languageDirectory.canonicalList(stored.languages),
  };

  return (
    <ProfileEditor values={values} locale={locale as Locale} avatarUrl={me.avatarUrl} />
  );
}

function ProfileEditor({
  values,
  locale,
  avatarUrl,
}: {
  values: VolunteerProfile;
  locale: Locale;
  avatarUrl?: string;
}) {
  const t = useTranslations("profile");
  const opportunities = useTranslations("opportunities");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={navHref("profile")}
          className="enter-rise inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold text-primary-ink underline-offset-4 hover:underline"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {t("edit.back")}
        </Link>
        <PageHeader
          title={t("form.title")}
          description={t("form.description")}
          className="mt-3"
        />
      </div>

      <AvatarEditor
        currentUrl={avatarUrl}
        initials={initialsOf(values.fullName)}
        labels={{
          title: t("avatar.title"),
          description: t("avatar.description"),
          choose: t("avatar.choose"),
          replace: t("avatar.replace"),
          remove: t("avatar.remove"),
          removing: t("avatar.removing"),
          zoom: t("avatar.zoom"),
          position: t("avatar.position"),
          upload: t("avatar.upload"),
          uploading: t("avatar.uploading"),
          saved: t("avatar.saved"),
          removed: t("avatar.removed"),
          errors: {
            avatarTooLarge: t("avatar.errors.tooLarge"),
            avatarFormatUnsupported: t("avatar.errors.unsupported"),
            avatarDimensions: t("avatar.errors.dimensions"),
            avatarTooSmall: t("avatar.errors.dimensions"),
            avatarInvalid: t("avatar.errors.invalid"),
            avatarUploadUnavailable: t("avatar.errors.unavailable"),
            network: t("avatar.errors.network"),
            unknown: t("avatar.errors.unknown"),
          },
        }}
      />

      <ProfileForm
        values={values}
        languageOptions={languageDirectory.options(locale, values.languages)}
        regions={REGIONS.map((region) => ({
          value: region,
          label: opportunities(`regions.${region}`),
        }))}
        headed={false}
        doneHref={navHref("profile")}
        cancelHref={navHref("profile")}
        labels={{
          title: t("form.title"),
          description: t("form.description"),
          sections: Object.fromEntries(
            SECTION_KEYS.map((key) => [key, t(`sections.${key}`)]),
          ) as Record<(typeof SECTION_KEYS)[number], string>,
          sectionHelp: Object.fromEntries(
            SECTION_KEYS.map((key) => [key, t(`sectionHelp.${key}`)]),
          ) as Record<(typeof SECTION_KEYS)[number], string>,
          fields: Object.fromEntries(
            FIELD_KEYS.map((key) => [key, t(`fields.${key}`)]),
          ) as Record<(typeof FIELD_KEYS)[number], string>,
          optional: t("optional"),
          save: t("save"),
          saving: t("saving"),
          saved: t("saved"),
          saveError: t("saveError"),
          fieldInvalid: t("fieldInvalid"),
          cancel: t("edit.cancel"),
        }}
      />
    </div>
  );
}
