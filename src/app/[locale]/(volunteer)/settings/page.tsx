import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { SignOutButton } from "@/components/shared/sign-out-button";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";

/** Language and account. */
export default async function SettingsPage(props: PageProps<"/[locale]/settings">) {
  const { locale } = await props.params;
  setRequestLocale(locale as Locale);

  const t = await getTranslations("profile.settings");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("subtitle")} />

      <Surface as="section" padding="md" className="flex flex-col gap-3">
        <h2 className="font-display text-base font-semibold">{t("language")}</h2>
        <p className="text-sm leading-6 text-muted">{t("languageHelp")}</p>
        <LanguageSwitcher className="self-start" />
      </Surface>

      <Surface as="section" padding="md" className="flex flex-col gap-3">
        <h2 className="font-display text-base font-semibold">{t("account")}</h2>
        <SignOutButton />
      </Surface>
    </div>
  );
}
