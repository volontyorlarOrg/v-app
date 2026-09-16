"use client";

import { useId, type ReactNode } from "react";
import { toast } from "sonner";

import { ActionStatus } from "@/components/app/action-status";
import { Panel } from "@/components/app/panel";
import { LanguagePicker } from "@/components/profile/language-picker";
import { Button, buttonClass } from "@/components/ui/button";
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
import { Link, useRouter } from "@/i18n/navigation";
import { updateProfileAction } from "@/lib/profile/actions";
import type { VolunteerProfile } from "@/lib/profile/completion";
import {
  PROFILE_NAME_MIN_LENGTH,
  PROFILE_TEXT_LIMITS,
  profileFormSchema,
  profileFormValues,
  type ProfileFormValues,
} from "@/lib/profile/input";
import type { LanguageOption } from "@/lib/profile/languages";

export type ProfileSection = "about" | "education" | "location" | "contact" | "links";

export type ProfileFormLabels = {
  title: string;
  description: string;
  sections: Record<ProfileSection, string>;
  sectionHelp: Record<ProfileSection, string>;
  fields: Record<
    | "fullName"
    | "bio"
    | "bioHelp"
    | "school"
    | "gradeYear"
    | "region"
    | "regionAny"
    | "city"
    | "languages"
    | "languagesHelp"
    | "languagesSearch"
    | "languagesEmpty"
    | "languagesCommon"
    | "languagesAll"
    | "languagesRemove"
    | "languagesLimit"
    | "phone"
    | "phoneHelp"
    | "telegram"
    | "telegramHelp"
    | "links"
    | "linksHelp",
    string
  >;
  optional: string;
  save: string;
  saving: string;
  saved: string;
  saveError: string;
  fieldInvalid: string;
  cancel?: string;
};

function ProfileField({
  id,
  label,
  optional,
  help,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: string;
  help?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <Field invalid={Boolean(error)}>
      <FieldLabel id={`${id}-label`} htmlFor={id}>
        {label}
        {optional ? (
          <>
            {" "}
            <span className="ml-1 text-xs font-normal text-ink-muted">{optional}</span>
          </>
        ) : null}
      </FieldLabel>
      {children}
      {help ? <FieldDescription id={`${id}-help`}>{help}</FieldDescription> : null}
      <FieldError>{error}</FieldError>
    </Field>
  );
}

function FormSection({
  title,
  help,
  children,
}: {
  title: string;
  help: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-4 border-t border-border pt-6 first:border-t-0 first:pt-0 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10">
      <div>
        <h3 className="font-sans text-sm font-semibold text-ink">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-ink-muted">{help}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function ProfileForm({
  values,
  languageOptions,
  regions,
  labels,
  headed = true,
  doneHref,
  cancelHref,
}: {
  values: VolunteerProfile;
  languageOptions: readonly LanguageOption[];
  regions: readonly { value: string; label: string }[];
  labels: ProfileFormLabels;
  headed?: boolean;
  doneHref?: string;
  cancelHref?: string;
}) {
  const id = useId();
  const router = useRouter();
  const { form, result, pending, formProps } = useActionForm({
    schema: profileFormSchema,
    defaultValues: profileFormValues(values),
    action: updateProfileAction,
    onSuccess: () => {
      toast.success(labels.saved);
      if (doneHref) router.push(doneHref);
    },
  });
  const { register, formState, control: formControl } = form;

  const fieldId = (name: keyof ProfileFormValues) => `${id}-${name}`;
  const invalid = (name: keyof ProfileFormValues) =>
    Boolean(formState.errors[name]) ||
    (result.status === "error" && Boolean(result.fields[name]));
  const errorFor = (name: keyof ProfileFormValues) =>
    invalid(name) ? labels.fieldInvalid : undefined;
  const control = (name: keyof ProfileFormValues, help?: string) => ({
    id: fieldId(name),
    "aria-describedby": help ? `${fieldId(name)}-help` : undefined,
    "aria-invalid": invalid(name) || undefined,
    ...register(name),
  });

  return (
    <form {...formProps}>
      <Panel
        id="edit"
        title={headed ? labels.title : undefined}
        description={headed ? labels.description : undefined}
        className="scroll-mt-20"
      >
        <div className="flex flex-col gap-6 py-1">
          <FormSection title={labels.sections.about} help={labels.sectionHelp.about}>
            <FieldGroup>
              <ProfileField
                id={fieldId("fullName")}
                label={labels.fields.fullName}
                error={errorFor("fullName")}
              >
                <Input
                  {...control("fullName")}
                  defaultValue={values.fullName}
                  autoComplete="name"
                  required
                  minLength={PROFILE_NAME_MIN_LENGTH}
                  maxLength={PROFILE_TEXT_LIMITS.fullName}
                />
              </ProfileField>
              <ProfileField
                id={fieldId("bio")}
                label={labels.fields.bio}
                help={labels.fields.bioHelp}
                error={errorFor("bio")}
              >
                <Textarea
                  {...control("bio", labels.fields.bioHelp)}
                  defaultValue={values.bio}
                  maxLength={PROFILE_TEXT_LIMITS.bio}
                />
              </ProfileField>
              <ProfileField
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
              </ProfileField>
            </FieldGroup>
          </FormSection>

          <FormSection
            title={labels.sections.education}
            help={labels.sectionHelp.education}
          >
            <div className="grid gap-5 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <ProfileField
                id={fieldId("school")}
                label={labels.fields.school}
                error={errorFor("school")}
              >
                <Input
                  {...control("school")}
                  defaultValue={values.school}
                  maxLength={PROFILE_TEXT_LIMITS.school}
                />
              </ProfileField>
              <ProfileField
                id={fieldId("gradeYear")}
                label={labels.fields.gradeYear}
                error={errorFor("gradeYear")}
              >
                <Input
                  {...control("gradeYear")}
                  defaultValue={values.gradeYear}
                  maxLength={PROFILE_TEXT_LIMITS.gradeYear}
                />
              </ProfileField>
            </div>
          </FormSection>

          <FormSection
            title={labels.sections.location}
            help={labels.sectionHelp.location}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <ProfileField id={fieldId("region")} label={labels.fields.region}>
                <NativeSelect {...control("region")} defaultValue={values.region ?? ""}>
                  <NativeSelectOption value="">
                    {labels.fields.regionAny}
                  </NativeSelectOption>
                  {regions.map((region) => (
                    <NativeSelectOption key={region.value} value={region.value}>
                      {region.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </ProfileField>
              <ProfileField
                id={fieldId("city")}
                label={labels.fields.city}
                error={errorFor("city")}
              >
                <Input
                  {...control("city")}
                  defaultValue={values.city}
                  maxLength={PROFILE_TEXT_LIMITS.city}
                />
              </ProfileField>
            </div>
          </FormSection>

          <FormSection
            title={labels.sections.contact}
            help={labels.sectionHelp.contact}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <ProfileField
                id={fieldId("phone")}
                label={labels.fields.phone}
                optional={labels.optional}
                help={labels.fields.phoneHelp}
                error={errorFor("phone")}
              >
                <Input
                  {...control("phone", labels.fields.phoneHelp)}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  defaultValue={values.phone}
                />
              </ProfileField>
              <ProfileField
                id={fieldId("telegram")}
                label={labels.fields.telegram}
                optional={labels.optional}
                help={labels.fields.telegramHelp}
                error={errorFor("telegram")}
              >
                <Input
                  {...control("telegram", labels.fields.telegramHelp)}
                  defaultValue={values.telegram}
                />
              </ProfileField>
            </div>
          </FormSection>

          <FormSection title={labels.sections.links} help={labels.sectionHelp.links}>
            <ProfileField
              id={fieldId("links")}
              label={labels.fields.links}
              optional={labels.optional}
              help={labels.fields.linksHelp}
              error={errorFor("links")}
            >
              <Input
                {...control("links", labels.fields.linksHelp)}
                defaultValue={values.links.join(", ")}
              />
            </ProfileField>
          </FormSection>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-border pt-6">
          <Button type="submit" disabled={pending} className="disabled:opacity-70">
            {pending ? labels.saving : labels.save}
          </Button>
          {cancelHref && labels.cancel ? (
            <Link href={cancelHref} className={buttonClass({ variant: "outline" })}>
              {labels.cancel}
            </Link>
          ) : null}
          {result.status === "error" ? (
            <ActionStatus tone="error">{labels.saveError}</ActionStatus>
          ) : null}
        </div>
      </Panel>
    </form>
  );
}
