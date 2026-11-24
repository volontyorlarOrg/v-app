import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import { LoadErrorRows, loadErrorLabels } from "@/components/app/load-error";
import {
  ONBOARDING_FIELD_KEYS,
  type OnboardingLabels,
} from "@/components/onboarding/labels";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import type { Locale } from "@/i18n/routing";
import { ACCOUNT_ERROR_KEYS } from "@/lib/account/types";
import {
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  usernameIdentity,
  type UsernameIdentity,
} from "@/lib/account/username";
import { getMe } from "@/lib/api/account.server";
import { loadPlaceDirectories } from "@/lib/api/directories.server";
import { dataOf, type LoadFailure } from "@/lib/api/load.server";
import type { District, Institution } from "@/lib/api/schemas";
import { getProfile } from "@/lib/api/profile.server";
import { requireSession } from "@/lib/api/session.server";
import { safeReturnPath } from "@/lib/auth/session";
import { welcomeStep } from "@/lib/onboarding/state";
import { readOnboardingState } from "@/lib/onboarding/state.server";
import { FORM_STEPS, type OnboardingStep } from "@/lib/onboarding/steps";
import { REGIONS } from "@/lib/opportunities/types";
import {
  COMPLETION_FIELDS,
  EMPTY_PROFILE,
  type CompletionField,
  type VolunteerProfile,
} from "@/lib/profile/completion";
import { languageDirectory } from "@/lib/profile/language-directory.server";
import { placeLabels } from "@/lib/profile/place-labels";
import { marketingOrigin } from "@/lib/seo/origin";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/welcome">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "onboarding" });
  return { title: t("metaTitle") };
}

export default async function WelcomePage({
  params,
  searchParams,
}: PageProps<"/[locale]/welcome">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { next } = await searchParams;
  const [session, profile, me, state, directories] = await Promise.all([
    requireSession(),
    getProfile(),
    getMe(),
    readOnboardingState(),
    loadPlaceDirectories(),
  ]);
  const places = dataOf(directories);

  const stored: VolunteerProfile = profile ?? {
    ...EMPTY_PROFILE,
    fullName: me.displayName?.trim() || session.displayName?.trim() || "",
  };
  const values = {
    ...stored,
    languages: languageDirectory.canonicalList(stored.languages),
  };
  const username = usernameIdentity(me);
  const origin = marketingOrigin();

  return (
    <Welcome
      locale={locale as Locale}
      values={values}
      profileSaved={profile !== null}
      next={safeReturnPath(typeof next === "string" ? next : null)}
      initialStep={welcomeStep(state, username.source)}
      username={username}
      addressPrefix={origin ? `${new URL(origin).host}/` : null}
      districts={places?.districts ?? []}
      universities={places?.universities ?? []}
      placeFailure={directories.status === "failed" ? directories.failure : null}
    />
  );
}

function Welcome({
  locale,
  values,
  profileSaved,
  next,
  initialStep,
  username,
  addressPrefix,
  districts,
  universities,
  placeFailure,
}: {
  locale: Locale;
  values: VolunteerProfile;
  profileSaved: boolean;
  next: string | null;
  initialStep: OnboardingStep;
  username: UsernameIdentity;
  addressPrefix: string | null;
  districts: District[];
  universities: Institution[];
  placeFailure: LoadFailure | null;
}) {
  const t = useTranslations("onboarding");
  const common = useTranslations("common");
  const profile = useTranslations("profile");
  const opportunities = useTranslations("opportunities");
  const settings = useTranslations("settings");

  const firstName = values.fullName.trim().split(/\s+/)[0] ?? "";

  const labels: OnboardingLabels = {
    stepCount: t("stepCount", { step: "{step}", total: "{total}" }),
    skipForNow: t("skipForNow"),
    skipStep: t("skipStep"),
    back: t("back"),
    continue: t("continue"),
    saving: t("saving"),
    start: t("start"),
    saveError: t("saveError"),
    nameNeeded: t("nameNeeded"),
    fieldInvalid: profile("fieldInvalid"),
    welcome: { title: t("welcome.title"), body: t("welcome.body") },
    steps: Object.fromEntries(
      FORM_STEPS.map((step) => [
        step,
        { title: t(`steps.${step}.title`), lead: t(`steps.${step}.lead`) },
      ]),
    ) as OnboardingLabels["steps"],
    rail: {
      label: t("rail.label"),
      states: {
        done: t("railState.done"),
        current: t("railState.current"),
        upcoming: t("railState.upcoming"),
      },
      items: Object.fromEntries(
        FORM_STEPS.map((step) => [step, t(`rail.${step}`)]),
      ) as OnboardingLabels["rail"]["items"],
    },
    fields: Object.fromEntries(
      ONBOARDING_FIELD_KEYS.map((key) => [key, profile(`fields.${key}`)]),
    ) as OnboardingLabels["fields"],
    place: placeLabels(profile),
    placeRequired: profile("place.required"),
    optional: profile("optional"),
    usernameStep: {
      field: t("usernameStep.field"),
      hint: settings("username.hint", {
        min: USERNAME_MIN_LENGTH,
        max: USERNAME_MAX_LENGTH,
      }),
      fromTelegram: t("usernameStep.fromTelegram"),
      address: t("usernameStep.address"),
      addressPlaceholder: t("usernameStep.addressPlaceholder"),
      errors: Object.fromEntries(
        ACCOUNT_ERROR_KEYS.map((key) => [key, settings(`errors.${key}`)]),
      ),
    },
    done: {
      title: t("done.title"),
      complete: t("done.complete"),
      incomplete: t("done.incomplete", { percent: "{percent}", fields: "{fields}" }),
      finishOnProfile: t("done.finishOnProfile"),
      nextTitle: t("done.nextTitle"),
      next: {
        apply: t("done.next.apply"),
        attend: t("done.next.attend"),
        confirm: t("done.next.confirm"),
      },
      cta: t("done.cta"),
      dashboard: t("done.dashboard"),
    },
  };

  const completionFields = Object.fromEntries(
    COMPLETION_FIELDS.map((field) => [field, profile(`completionFields.${field}`)]),
  ) as Record<CompletionField, string>;

  return (
    <OnboardingFlow
      title={firstName ? t("title", { name: firstName }) : t("titleAnonymous")}
      lead={t("lead")}
      initialStep={initialStep}
      initialValues={values}
      profileSaved={profileSaved}
      next={next}
      regions={REGIONS.map((region) => ({
        value: region,
        label: opportunities(`regions.${region}`),
      }))}
      languageOptions={languageDirectory.options(locale, values.languages)}
      districts={districts}
      universities={universities}
      placeUnavailable={
        placeFailure ? (
          <LoadErrorRows failure={placeFailure} labels={loadErrorLabels(common)} />
        ) : null
      }
      locale={locale}
      username={username}
      addressPrefix={addressPrefix}
      labels={labels}
      completionFields={completionFields}
    />
  );
}
