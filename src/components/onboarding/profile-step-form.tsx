"use client";

import { useId, type ReactNode } from "react";

import { ActionStatus } from "@/components/app/action-status";
import type { OnboardingLabels } from "@/components/onboarding/labels";
import { StepActions, StepField } from "@/components/onboarding/step-controls";
import { LanguagePicker } from "@/components/profile/language-picker";
import {
  PlaceFields,
  usePlaceValue,
  type PlaceFieldName,
} from "@/components/profile/place-fields";
import type { RegionOption } from "@/components/profile/region-options";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useActionForm } from "@/hooks/use-action-form";
import { PROFILE_STEP_FIELDS, type ProfileStep } from "@/lib/onboarding/steps";
import { updateProfileAction } from "@/lib/profile/actions";
import type { VolunteerProfile } from "@/lib/profile/completion";
import {
  PROFILE_NAME_MIN_LENGTH,
  PROFILE_TEXT_LIMITS,
  profileFormSchema,
  profileFormValues,
  profileInputFromFormData,
  requiredPlaceFormSchema,
  type ProfileFormValues,
} from "@/lib/profile/input";
import type { LanguageOption } from "@/lib/profile/languages";
import type { DistrictOption, InstitutionOption } from "@/lib/profile/place";

const ALL_FIELDS = [
  "fullName",
  "bio",
  "region",
  "districtId",
  "educationType",
  "institutionId",
  "gradeYear",
  "languages",
  "phone",
  "telegram",
  "instagram",
  "linkedin",
  "links",
] as const satisfies readonly (keyof ProfileFormValues)[];

export function ProfileStepForm({
  step,
  values,
  languageOptions,
  regions,
  districts,
  universities,
  placeUnavailable,
  locale,
  labels,
  onSaved,
  onSkip,
  onBack,
}: {
  step: ProfileStep;
  values: VolunteerProfile;
  languageOptions: readonly LanguageOption[];
  regions: readonly RegionOption[];
  districts: readonly DistrictOption[];
  universities: readonly InstitutionOption[];
  placeUnavailable?: ReactNode;
  locale: string;
  labels: OnboardingLabels;
  onSaved: (profile: VolunteerProfile) => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  const id = useId();
  const defaults = profileFormValues(values);
  const { form, formRef, result, pending, formProps } = useActionForm({
    schema: step === "place" ? requiredPlaceFormSchema : profileFormSchema,
    defaultValues: defaults,
    action: updateProfileAction,
    onSuccess: () => {
      const element = formRef.current;
      if (element)
        onSaved({ ...values, ...profileInputFromFormData(new FormData(element)) });
    },
  });
  const { register, formState, control: formControl } = form;
  const place = usePlaceValue(form);

  const shown: readonly (keyof ProfileFormValues)[] = PROFILE_STEP_FIELDS[step];
  const hidden = ALL_FIELDS.filter((field) => !shown.includes(field));
  const canSkip =
    step === "place"
      ? false
      : step !== "about" || values.fullName.trim().length >= PROFILE_NAME_MIN_LENGTH;

  const fieldId = (name: keyof ProfileFormValues) => `${id}-${name}`;
  const invalid = (name: keyof ProfileFormValues) =>
    Boolean(formState.errors[name]) ||
    (result.status === "error" && Boolean(result.fields[name]));
  const errorFor = (name: keyof ProfileFormValues) =>
    invalid(name)
      ? name === "fullName"
        ? labels.nameNeeded
        : formState.errors[name]?.message === "required"
          ? name === "gradeYear"
            ? labels.place.gradeRequired
            : labels.placeRequired
          : labels.fieldInvalid
      : undefined;
  const placeErrors = Object.fromEntries(
    (
      ["region", "districtId", "educationType", "institutionId", "gradeYear"] as const
    ).map((name) => [name, errorFor(name)]),
  ) as Partial<Record<PlaceFieldName, string>>;
  const control = (name: keyof ProfileFormValues, help?: string) => ({
    id: fieldId(name),
    "aria-describedby": help ? `${fieldId(name)}-help` : undefined,
    "aria-invalid": invalid(name) || undefined,
    ...register(name),
  });

  return (
    <form {...formProps} className="mt-6">
      {hidden.map((name) =>
        name === "languages" ? (
          defaults.languages.map((language) => (
            <input
              key={`languages-${language}`}
              type="hidden"
              name="languages"
              value={language}
            />
          ))
        ) : (
          <input
            key={name}
            type="hidden"
            {...register(name)}
            defaultValue={defaults[name]}
          />
        ),
      )}

      <FieldGroup>
        {step === "about" ? (
          <>
            <StepField
              id={fieldId("fullName")}
              label={labels.fields.fullName}
              error={errorFor("fullName")}
            >
              <Input
                {...control("fullName")}
                defaultValue={defaults.fullName}
                autoComplete="name"
                required
                minLength={PROFILE_NAME_MIN_LENGTH}
                maxLength={PROFILE_TEXT_LIMITS.fullName}
              />
            </StepField>
            <StepField
              id={fieldId("bio")}
              label={labels.fields.bio}
              help={labels.fields.bioHelp}
              error={errorFor("bio")}
            >
              <Textarea
                {...control("bio", labels.fields.bioHelp)}
                defaultValue={defaults.bio}
                maxLength={PROFILE_TEXT_LIMITS.bio}
                className="min-h-28"
              />
            </StepField>
          </>
        ) : null}

        {step === "place" ? (
          <>
            <PlaceFields
              idPrefix={id}
              value={place.value}
              onChange={place.onChange}
              errors={placeErrors}
              regions={regions}
              districts={districts}
              universities={universities}
              initialInstitution={values.institution}
              previous={{ city: values.city, school: values.school }}
              locale={locale}
              labels={labels.place}
              unavailable={placeUnavailable}
            />
            <StepField
              id={fieldId("languages")}
              label={labels.fields.languages}
              help={labels.fields.languagesHelp}
              error={errorFor("languages")}
            >
              <LanguagePicker
                id={fieldId("languages")}
                control={formControl}
                options={languageOptions}
                invalid={invalid("languages")}
                describedBy={`${fieldId("languages")}-help`}
                labels={{
                  search: labels.fields.languagesSearch,
                  empty: labels.fields.languagesEmpty,
                  common: labels.fields.languagesCommon,
                  all: labels.fields.languagesAll,
                  remove: labels.fields.languagesRemove,
                  limit: labels.fields.languagesLimit,
                }}
              />
            </StepField>
          </>
        ) : null}

        {step === "contact" ? (
          <div className="flex flex-col gap-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <StepField
                id={fieldId("phone")}
                label={labels.fields.phone}
                help={labels.fields.phoneHelp}
                error={errorFor("phone")}
              >
                <Input
                  {...control("phone", labels.fields.phoneHelp)}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  defaultValue={defaults.phone}
                />
              </StepField>
              <StepField
                id={fieldId("telegram")}
                label={labels.fields.telegram}
                help={labels.fields.telegramHelp}
                error={errorFor("telegram")}
              >
                <Input
                  {...control("telegram", labels.fields.telegramHelp)}
                  autoComplete="username"
                  autoCapitalize="none"
                  defaultValue={defaults.telegram}
                />
              </StepField>
            </div>
            <div className="grid gap-5 border-t border-border pt-6 sm:grid-cols-2">
              <StepField
                id={fieldId("instagram")}
                label={labels.fields.instagram}
                optional={labels.optional}
                help={labels.fields.instagramHelp}
                error={errorFor("instagram")}
              >
                <Input
                  {...control("instagram", labels.fields.instagramHelp)}
                  autoComplete="username"
                  autoCapitalize="none"
                  defaultValue={defaults.instagram}
                />
              </StepField>
              <StepField
                id={fieldId("linkedin")}
                label={labels.fields.linkedin}
                optional={labels.optional}
                help={labels.fields.linkedinHelp}
                error={errorFor("linkedin")}
              >
                <Input
                  {...control("linkedin", labels.fields.linkedinHelp)}
                  inputMode="url"
                  autoCapitalize="none"
                  defaultValue={defaults.linkedin}
                />
              </StepField>
            </div>
            <StepField
              id={fieldId("links")}
              label={labels.fields.links}
              optional={labels.optional}
              help={labels.fields.linksHelp}
              error={errorFor("links")}
            >
              <Input
                {...control("links", labels.fields.linksHelp)}
                inputMode="url"
                autoCapitalize="none"
                defaultValue={defaults.links}
              />
            </StepField>
          </div>
        ) : null}
      </FieldGroup>

      {result.status === "error" ? (
        <ActionStatus tone="error" className="mt-5">
          {labels.saveError}
        </ActionStatus>
      ) : null}

      <StepActions
        pending={pending}
        blocked={step === "place" && Boolean(placeUnavailable)}
        labels={labels}
        onSkip={canSkip ? onSkip : undefined}
        onBack={onBack}
      />
    </form>
  );
}
