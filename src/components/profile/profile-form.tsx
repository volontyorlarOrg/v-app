"use client";

import { useId, type ReactNode } from "react";
import { toast } from "sonner";

import { ActionStatus } from "@/components/app/action-status";
import { Panel } from "@/components/app/panel";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useActionForm } from "@/hooks/use-action-form";
import { updateProfileAction } from "@/lib/profile/actions";
import type { VolunteerProfile } from "@/lib/profile/completion";
import {
  PROFILE_NAME_MIN_LENGTH,
  PROFILE_TEXT_LIMITS,
  profileFormSchema,
  profileFormValues,
  type ProfileFormValues,
} from "@/lib/profile/input";

export type ProfileFormLabels = {
  sections: Record<
    "identity" | "education" | "location" | "skills" | "contact" | "links",
    string
  >;
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
    | "skills"
    | "skillsHelp"
    | "phone"
    | "phoneHelp"
    | "telegram"
    | "telegramHelp"
    | "links"
    | "linksHelp",
    string
  >;
  save: string;
  saving: string;
  saved: string;
  saveError: string;
  fieldInvalid: string;
};

function ProfileField({
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

function SubsectionTitle({ children }: { children: ReactNode }) {
  return <h3 className="mb-4 font-sans text-sm font-semibold text-ink">{children}</h3>;
}

export function ProfileForm({
  values,
  regions,
  labels,
}: {
  values: VolunteerProfile;
  regions: readonly { value: string; label: string }[];
  labels: ProfileFormLabels;
}) {
  const id = useId();
  const { form, result, pending, formProps } = useActionForm({
    schema: profileFormSchema,
    defaultValues: profileFormValues(values),
    action: updateProfileAction,
    onSuccess: () => toast.success(labels.saved),
  });
  const { register, formState } = form;

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
    <form {...formProps} className="flex flex-col gap-6">
      <Panel title={labels.sections.identity}>
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
          <Separator />
          <div>
            <SubsectionTitle>{labels.sections.education}</SubsectionTitle>
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
          </div>
          <Separator />
          <div>
            <SubsectionTitle>{labels.sections.location}</SubsectionTitle>
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
          </div>
        </FieldGroup>
      </Panel>

      <Panel title={labels.sections.skills}>
        <FieldGroup className="grid sm:grid-cols-2">
          <ProfileField
            id={fieldId("languages")}
            label={labels.fields.languages}
            help={labels.fields.languagesHelp}
            error={errorFor("languages")}
          >
            <Input
              {...control("languages", labels.fields.languagesHelp)}
              defaultValue={values.languages.join(", ")}
            />
          </ProfileField>
          <ProfileField
            id={fieldId("skills")}
            label={labels.fields.skills}
            help={labels.fields.skillsHelp}
            error={errorFor("skills")}
          >
            <Input
              {...control("skills", labels.fields.skillsHelp)}
              defaultValue={values.skills.join(", ")}
            />
          </ProfileField>
        </FieldGroup>
      </Panel>

      <Panel title={labels.sections.contact}>
        <FieldGroup>
          <div className="grid gap-5 sm:grid-cols-2">
            <ProfileField
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
                defaultValue={values.phone}
              />
            </ProfileField>
            <ProfileField
              id={fieldId("telegram")}
              label={labels.fields.telegram}
              help={labels.fields.telegramHelp}
              error={errorFor("telegram")}
            >
              <Input
                {...control("telegram", labels.fields.telegramHelp)}
                defaultValue={values.telegram}
              />
            </ProfileField>
          </div>
          <Separator />
          <div>
            <SubsectionTitle>{labels.sections.links}</SubsectionTitle>
            <ProfileField
              id={fieldId("links")}
              label={labels.fields.links}
              help={labels.fields.linksHelp}
              error={errorFor("links")}
            >
              <Input
                {...control("links", labels.fields.linksHelp)}
                defaultValue={values.links.join(", ")}
              />
            </ProfileField>
          </div>
        </FieldGroup>
      </Panel>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={pending} className="disabled:opacity-70">
          {pending ? labels.saving : labels.save}
        </Button>
        {result.status === "error" ? (
          <ActionStatus tone="error">{labels.saveError}</ActionStatus>
        ) : null}
      </div>
    </form>
  );
}
