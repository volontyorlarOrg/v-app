import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getMyProfile } from "@/features/profile/api.server";
import { profileCompletion } from "@/features/profile/schemas";
import { ProfileCompletionCard } from "@/components/volunteers/profile-completion";
import { ProfileForm } from "@/components/volunteers/profile-form";
import { ApiErrorState } from "@/components/shared/api-error-state";
import { PageHeader } from "@/components/ui/page-header";

/**
 * Profile editor.
 *
 * Server-fetches the profile and hands it to the form as complete default
 * values. The form owns the draft; the server owns the record. Mirroring the
 * record into component state to make it editable is the anti-pattern handoff
 * §15 calls out, and the reason the form takes `defaultValues` rather than a
 * live object.
 */
export default async function ProfilePage(props: PageProps<"/[locale]/profile">) {
  const { locale } = await props.params;
  setRequestLocale(locale as Locale);

  const t = await getTranslations("profile");

  let profile;

  try {
    profile = await getMyProfile();
  } catch (error) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={t("title")} description={t("subtitle")} />
        <ApiErrorState error={error} />
      </div>
    );
  }

  const completion = profileCompletion(profile);
  const missingLabels = completion.missing.map((field) =>
    field === "contact" ? t("sections.contact") : t(`fields.${field}`),
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("subtitle")} />

      <ProfileCompletionCard
        completion={completion}
        fieldLabels={missingLabels}
      />

      <ProfileForm defaultValues={profile} />
    </div>
  );
}
