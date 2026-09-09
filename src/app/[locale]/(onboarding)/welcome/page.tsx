import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import type { OnboardingLabels } from "@/components/onboarding/labels";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import type { Locale } from "@/i18n/routing";
import { getMe } from "@/lib/api/account.server";
import { getProfile } from "@/lib/api/profile.server";
import { requireSession } from "@/lib/api/session.server";
import { safeReturnPath } from "@/lib/auth/session";
import { resumeStep } from "@/lib/onboarding/state";
import { readOnboardingState } from "@/lib/onboarding/state.server";
import { FORM_STEPS, type OnboardingStep } from "@/lib/onboarding/steps";
import { REGIONS } from "@/lib/opportunities/types";
import {
  COMPLETION_FIELDS,
  EMPTY_PROFILE,
  type CompletionField,
  type VolunteerProfile,
} from "@/lib/profile/completion";

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
  const [session, profile, me, state] = await Promise.all([
    requireSession(),
    getProfile(),
    getMe(),
    readOnboardingState(),
  ]);

  const values: VolunteerProfile = profile ?? {
    ...EMPTY_PROFILE,
    fullName: me.displayName?.trim() || session.displayName?.trim() || "",
  };

  return (
    <Welcome
      locale={locale as Locale}
      values={values}
      profileSaved={profile !== null}
      next={safeReturnPath(typeof next === "string" ? next : null)}
      initialStep={resumeStep(state)}
    />
  );
}

function Welcome({
  locale,
  values,
  profileSaved,
  next,
  initialStep,
}: {
  locale: Locale;
  values: VolunteerProfile;
  profileSaved: boolean;
  next: string | null;
  initialStep: OnboardingStep;
}) {
  const t = useTranslations("onboarding");
  const profile = useTranslations("profile");
  const opportunities = useTranslations("opportunities");

  const firstName = values.fullName.trim().split(/\s+/)[0] ?? "";
  const fieldKeys = [
    "fullName",
    "bio",
    "bioHelp",
    "school",
    "region",
    "regionAny",
    "languages",
    "languagesHelp",
    "phone",
    "phoneHelp",
    "telegram",
    "telegramHelp",
  ] as const;

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
      fieldKeys.map((key) => [key, profile(`fields.${key}`)]),
    ) as OnboardingLabels["fields"],
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
      locale={locale}
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
      labels={labels}
      completionFields={completionFields}
    />
  );
}
