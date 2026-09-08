"use client";

import { ArrowLeft } from "lucide-react";
import { useId, type ReactNode } from "react";

import { ActionStatus } from "@/components/app/action-status";
import type { OnboardingLabels } from "@/components/onboarding/labels";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
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
  type ProfileFormValues,
} from "@/lib/profile/input";

const ALL_FIELDS = [
  "fullName",
  "bio",
  "school",
  "gradeYear",
  "region",
  "city",
  "languages",
  "skills",
  "phone",
  "telegram",
  "links",
] as const satisfies readonly (keyof ProfileFormValues)[];

export function ProfileStepForm({
  step,
  values,
  regions,
  labels,
  onSaved,
  onSkip,
  onBack,
}: {
  step: ProfileStep;
  values: VolunteerProfile;
  regions: readonly { value: string; label: string }[];
  labels: OnboardingLabels;
  onSaved: (profile: VolunteerProfile) => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  const id = useId();
  const defaults = profileFormValues(values);
  const { form, formRef, result, pending, formProps } = useActionForm({
    schema: profileFormSchema,
    defaultValues: defaults,
    action: updateProfileAction,
    onSuccess: () => {
      const element = formRef.current;
      if (element) onSaved(profileInputFromFormData(new FormData(element)));
    },
  });
  const { register, formState } = form;

  const shown: readonly (keyof ProfileFormValues)[] = PROFILE_STEP_FIELDS[step];
  const hidden = ALL_FIELDS.filter((field) => !shown.includes(field));
  const canSkip =
    step !== "about" || values.fullName.trim().length >= PROFILE_NAME_MIN_LENGTH;

  const fieldId = (name: keyof ProfileFormValues) => `${id}-${name}`;
  const invalid = (name: keyof ProfileFormValues) =>
    Boolean(formState.errors[name]) ||
    (result.status === "error" && Boolean(result.fields[name]));
  const errorFor = (name: keyof ProfileFormValues) =>
    invalid(name)
      ? name === "fullName"
        ? labels.nameNeeded
        : labels.fieldInvalid
      : undefined;
  const control = (name: keyof ProfileFormValues, help?: string) => ({
    id: fieldId(name),
    "aria-describedby": help ? `${fieldId(name)}-help` : undefined,
    "aria-invalid": invalid(name) || undefined,
    ...register(name),
  });

  return (
    <form {...formProps} className="mt-6">
      {hidden.map((name) => (
        <input
          key={name}
          type="hidden"
          {...register(name)}
          defaultValue={defaults[name]}
        />
      ))}

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
            <StepField
              id={fieldId("school")}
              label={labels.fields.school}
              error={errorFor("school")}
            >
              <Input
                {...control("school")}
                defaultValue={defaults.school}
                autoComplete="organization"
                maxLength={PROFILE_TEXT_LIMITS.school}
              />
            </StepField>
            <StepField id={fieldId("region")} label={labels.fields.region}>
              <NativeSelect {...control("region")} defaultValue={defaults.region}>
                <NativeSelectOption value="">
                  {labels.fields.regionAny}
                </NativeSelectOption>
                {regions.map((region) => (
                  <NativeSelectOption key={region.value} value={region.value}>
                    {region.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </StepField>
            <StepField
              id={fieldId("languages")}
              label={labels.fields.languages}
              help={labels.fields.languagesHelp}
              error={errorFor("languages")}
            >
              <Input
                {...control("languages", labels.fields.languagesHelp)}
                defaultValue={defaults.languages}
              />
            </StepField>
          </>
        ) : null}

        {step === "contact" ? (
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
        ) : null}
      </FieldGroup>

      {result.status === "error" ? (
        <ActionStatus tone="error" className="mt-5">
          {labels.saveError}
        </ActionStatus>
      ) : null}

      <StepActions
        pending={pending}
        labels={labels}
        onSkip={canSkip ? onSkip : undefined}
        onBack={onBack}
      />
    </form>
  );
}

export function StepField({
  id,
  label,
  help,
  error,
  children,
}: {
  id: string;
  label: string;
  help?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <Field invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {children}
      {help ? <FieldDescription id={`${id}-help`}>{help}</FieldDescription> : null}
      <FieldError>{error}</FieldError>
    </Field>
  );
}

export function StepActions({
  pending,
  labels,
  onSkip,
  onBack,
}: {
  pending: boolean;
  labels: Pick<OnboardingLabels, "continue" | "saving" | "skipStep" | "back">;
  onSkip?: () => void;
  onBack?: () => void;
}) {
  return (
    <div className="mt-7 flex flex-wrap items-center gap-2 border-t border-border pt-5">
      <Button
        type="submit"
        size="sm"
        disabled={pending}
        className="w-full sm:w-auto sm:min-w-36"
      >
        {pending ? labels.saving : labels.continue}
      </Button>
      <div className="flex w-full items-center justify-between gap-2 sm:contents">
        {onSkip ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onSkip}
            disabled={pending}
          >
            {labels.skipStep}
          </Button>
        ) : null}
        {onBack ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBack}
            disabled={pending}
            className="ml-auto"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            {labels.back}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
