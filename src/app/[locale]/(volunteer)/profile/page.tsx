import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import { LocaleSwitcher } from "@/components/app/locale-switcher";
import { Panel } from "@/components/app/panel";
import { PageHeader } from "@/components/app/page-header";
import { ThemeSwitch } from "@/components/app/theme-switch";
import { SignOutForm } from "@/components/auth/sign-out-form";
import { ProfileMeter } from "@/components/dashboard/profile-meter";
import { ProfileForm } from "@/components/profile/profile-form";
import { IdentityList } from "@/components/settings/identity-list";
import {
  PreferenceSwitches,
  type PreferenceItem,
} from "@/components/settings/preference-switches";
import { buttonClass } from "@/components/ui/button";
import type { Locale } from "@/i18n/routing";
import type { LinkedIdentities, PreferenceKey, Preferences } from "@/lib/account/types";
import { getMe, getPreferences } from "@/lib/api/account.server";
import { getProfile } from "@/lib/api/profile.server";
import { requireSession } from "@/lib/api/session.server";
import { REGIONS } from "@/lib/opportunities/types";
import {
  EMPTY_PROFILE,
  profileCompletion,
  type VolunteerProfile,
} from "@/lib/profile/completion";

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

  const [session, profile, me, preferences] = await Promise.all([
    requireSession(),
    getProfile(),
    getMe(),
    getPreferences(),
  ]);

  const values: VolunteerProfile = profile ?? {
    ...EMPTY_PROFILE,
    fullName: me.displayName?.trim() || session.displayName?.trim() || "",
  };
  const identities: LinkedIdentities = {
    telegram: me.telegramIdentity
      ? { username: me.telegramIdentity.username ?? "" }
      : null,
    google: null,
    email: null,
  };

  return (
    <Profile
      locale={locale as Locale}
      values={values}
      preferences={preferences}
      identities={identities}
    />
  );
}

function Profile({
  locale,
  values,
  preferences,
  identities,
}: {
  locale: Locale;
  values: VolunteerProfile;
  preferences: Preferences;
  identities: LinkedIdentities;
}) {
  const t = useTranslations("profile");
  const opportunities = useTranslations("opportunities");
  const settings = useTranslations("settings");
  const nav = useTranslations("nav");
  const completion = profileCompletion(values);

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
    "skills",
    "skillsHelp",
    "phone",
    "phoneHelp",
    "telegram",
    "telegramHelp",
    "links",
    "linksHelp",
  ] as const;
  const sectionKeys = [
    "identity",
    "education",
    "location",
    "skills",
    "contact",
    "links",
  ] as const;
  const preference = (
    key: PreferenceKey,
    group: "notifications" | "privacy",
    name: string,
  ): PreferenceItem => ({
    key,
    label: settings(`${group}.${name}`),
    description: settings(`${group}.${name}Help`),
    checked: preferences[key],
  });

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="enter-rise min-w-0 [--enter-delay:90ms]">
          <ProfileForm
            values={values}
            regions={REGIONS.map((region) => ({
              value: region,
              label: opportunities(`regions.${region}`),
            }))}
            labels={{
              sections: Object.fromEntries(
                sectionKeys.map((key) => [key, t(`sections.${key}`)]),
              ) as Record<(typeof sectionKeys)[number], string>,
              fields: Object.fromEntries(
                fieldKeys.map((key) => [key, t(`fields.${key}`)]),
              ) as Record<(typeof fieldKeys)[number], string>,
              save: t("save"),
              saving: t("saving"),
              saved: t("saved"),
              saveError: t("saveError"),
              fieldInvalid: t("fieldInvalid"),
            }}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <Panel id="completion" title={t("completion.label")}>
            <ProfileMeter completion={completion} withAction={false} />
          </Panel>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel
          id="notifications"
          title={settings("notifications.title")}
          description={settings("notifications.description")}
        >
          <PreferenceSwitches
            items={[
              preference("notifyTelegram", "notifications", "telegram"),
              preference("remindDeadlines", "notifications", "deadlines"),
              preference("notifyDecisions", "notifications", "decisions"),
            ]}
            errorLabel={settings("preferences.saveError")}
          />
        </Panel>

        <Panel
          id="preferences"
          title={settings("preferences.title")}
          description={settings("preferences.description")}
        >
          <div className="flex flex-col gap-5">
            <PreferenceSwitches
              items={[
                preference("profileToOrganisers", "privacy", "profileToOrganisers"),
                preference("levelPublic", "privacy", "levelPublic"),
              ]}
              errorLabel={settings("preferences.saveError")}
            />
            <div className="border-t border-border pt-5">
              <ThemeSwitch
                label={settings("appearance.darkTheme")}
                description={settings("appearance.darkThemeHelp")}
              />
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-border pt-5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">
                  {settings("appearance.language")}
                </p>
                <p className="mt-0.5 text-sm text-ink-muted">
                  {settings("appearance.languageHelp")}
                </p>
              </div>
              <LocaleSwitcher label={nav("languageLabel")} />
            </div>
          </div>
        </Panel>

        <Panel
          id="account"
          title={settings("accountGroup.title")}
          description={settings("accountGroup.description")}
          className="xl:col-span-2"
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <IdentityList identities={identities} />
            <div className="border-t border-border pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
              <h3 className="font-sans text-sm font-semibold text-ink">
                {settings("session.title")}
              </h3>
              <p className="mt-1 text-sm text-ink-muted">
                {settings("session.description")}
              </p>
              <SignOutForm
                locale={locale}
                label={settings("session.signOut")}
                showIcon={false}
                className={buttonClass({
                  variant: "outline",
                  size: "sm",
                  className: "mt-4",
                })}
              />
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
}
