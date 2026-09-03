import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import { LocaleSwitcher } from "@/components/app/locale-switcher";
import { Panel } from "@/components/app/panel";
import { PageHeader } from "@/components/app/page-header";
import { PreviewNote } from "@/components/app/preview-note";
import { ThemeSwitch } from "@/components/app/theme-switch";
import { IdentityList } from "@/components/settings/identity-list";
import {
  PreferenceSwitches,
  type PreferenceItem,
} from "@/components/settings/preference-switches";
import { buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { PreferenceKey } from "@/lib/account/types";
import { navHref } from "@/lib/routing/routes";
import { sampleVolunteer } from "@/lib/sample/volunteer";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/settings">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "settings" });
  return { title: t("metaTitle") };
}

export default async function SettingsPage({
  params,
}: PageProps<"/[locale]/settings">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Settings />;
}

function Settings() {
  const t = useTranslations("settings");
  const nav = useTranslations("nav");
  const common = useTranslations("common");
  const volunteer = sampleVolunteer();

  const preference = (
    key: PreferenceKey,
    group: "notifications" | "privacy",
    name: string,
  ): PreferenceItem => ({
    key,
    label: t(`${group}.${name}`),
    description: t(`${group}.${name}Help`),
    defaultChecked: volunteer.preferences[key],
  });

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        chip={common("sample.chip")}
      />
      <PreviewNote
        chip={common("preview.chip")}
        body={t("preview")}
        className="enter-rise mt-4 [--enter-delay:90ms]"
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel
          id="notifications"
          title={t("notifications.title")}
          description={t("notifications.description")}
        >
          <PreferenceSwitches
            items={[
              preference("notifyTelegram", "notifications", "telegram"),
              preference("notifyEmail", "notifications", "email"),
              preference("remindDeadlines", "notifications", "deadlines"),
              preference("notifyDecisions", "notifications", "decisions"),
            ]}
          />
        </Panel>

        <Panel
          id="preferences"
          title={t("preferences.title")}
          description={t("preferences.description")}
        >
          <div className="flex flex-col gap-5">
            <div>
              <h3 className="mb-3 font-sans text-sm font-semibold text-ink">
                {t("privacy.title")}
              </h3>
              <PreferenceSwitches
                items={[
                  preference("profileToOrganisers", "privacy", "profileToOrganisers"),
                  preference("levelPublic", "privacy", "levelPublic"),
                ]}
              />
            </div>
            <div className="border-t border-border pt-5">
              <h3 className="mb-3 font-sans text-sm font-semibold text-ink">
                {t("appearance.title")}
              </h3>
              <ThemeSwitch
                label={t("appearance.darkTheme")}
                description={t("appearance.darkThemeHelp")}
              />
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-border pt-5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">
                  {t("appearance.language")}
                </p>
                <p className="mt-0.5 text-sm text-ink-muted">
                  {t("appearance.languageHelp")}
                </p>
              </div>
              <LocaleSwitcher label={nav("languageLabel")} />
            </div>
          </div>
        </Panel>

        <Panel
          id="account"
          title={t("accountGroup.title")}
          description={t("accountGroup.description")}
          className="xl:col-span-2"
        >
          <div className="grid gap-6 lg:grid-cols-3">
            <div>
              <h3 className="mb-3 font-sans text-sm font-semibold text-ink">
                {t("account.title")}
              </h3>
              <IdentityList identities={volunteer.identities} />
            </div>
            <div className="border-t border-border pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
              <h3 className="font-sans text-sm font-semibold text-ink">
                {t("session.title")}
              </h3>
              <p className="mt-1 text-sm text-ink-muted">{t("session.description")}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={navHref("login")}
                  className={buttonClass({ variant: "outline", size: "sm" })}
                >
                  {t("session.signOut")}
                </Link>
                <button
                  type="button"
                  disabled
                  className={buttonClass({ variant: "ghost", size: "sm" })}
                >
                  {t("session.signOutEverywhere")}
                </button>
              </div>
            </div>
            <div className="border-t border-border pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
              <h3 className="font-sans text-sm font-semibold text-ink">
                {t("danger.title")}
              </h3>
              <p className="mt-1 text-sm text-ink-muted">{t("danger.description")}</p>
              <button
                type="button"
                disabled
                className={buttonClass({
                  variant: "outline",
                  size: "sm",
                  className: "mt-4",
                })}
              >
                {t("danger.delete")}
              </button>
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
}
