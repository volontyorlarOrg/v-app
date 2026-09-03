"use client";

import { useState, type FormEvent } from "react";

import { Panel } from "@/components/app/panel";
import { buttonClass } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import type { VolunteerProfile } from "@/lib/profile/completion";

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
  saved: string;
};

export function ProfileForm({
  values,
  regions,
  labels,
}: {
  values: VolunteerProfile;
  regions: readonly { value: string; label: string }[];
  labels: ProfileFormLabels;
}) {
  const [saved, setSaved] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <Panel title={labels.sections.identity}>
        <div className="flex flex-col gap-5">
          <Field label={labels.fields.fullName}>
            {(control) => (
              <Input
                {...control}
                name="fullName"
                defaultValue={values.fullName}
                autoComplete="name"
              />
            )}
          </Field>
          <Field label={labels.fields.bio} help={labels.fields.bioHelp}>
            {(control) => (
              <Textarea
                {...control}
                name="bio"
                defaultValue={values.bio}
                maxLength={600}
              />
            )}
          </Field>
          <div className="border-t border-border pt-5">
            <h3 className="mb-4 font-sans text-sm font-semibold text-ink">
              {labels.sections.education}
            </h3>
            <div className="grid gap-5 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <Field label={labels.fields.school}>
                {(control) => (
                  <Input {...control} name="school" defaultValue={values.school} />
                )}
              </Field>
              <Field label={labels.fields.gradeYear}>
                {(control) => (
                  <Input
                    {...control}
                    name="gradeYear"
                    defaultValue={values.gradeYear}
                  />
                )}
              </Field>
            </div>
          </div>
          <div className="border-t border-border pt-5">
            <h3 className="mb-4 font-sans text-sm font-semibold text-ink">
              {labels.sections.location}
            </h3>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={labels.fields.region}>
                {(control) => (
                  <Select {...control} name="region" defaultValue={values.region ?? ""}>
                    <option value="">{labels.fields.regionAny}</option>
                    {regions.map((region) => (
                      <option key={region.value} value={region.value}>
                        {region.label}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label={labels.fields.city}>
                {(control) => (
                  <Input {...control} name="city" defaultValue={values.city} />
                )}
              </Field>
            </div>
          </div>
        </div>
      </Panel>

      <Panel title={labels.sections.skills}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={labels.fields.languages} help={labels.fields.languagesHelp}>
            {(control) => (
              <Input
                {...control}
                name="languages"
                defaultValue={values.languages.join(", ")}
              />
            )}
          </Field>
          <Field label={labels.fields.skills} help={labels.fields.skillsHelp}>
            {(control) => (
              <Input
                {...control}
                name="skills"
                defaultValue={values.skills.join(", ")}
              />
            )}
          </Field>
        </div>
      </Panel>

      <Panel title={labels.sections.contact}>
        <div className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={labels.fields.phone} help={labels.fields.phoneHelp}>
              {(control) => (
                <Input
                  {...control}
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  defaultValue={values.phone}
                />
              )}
            </Field>
            <Field label={labels.fields.telegram} help={labels.fields.telegramHelp}>
              {(control) => (
                <Input {...control} name="telegram" defaultValue={values.telegram} />
              )}
            </Field>
          </div>
          <div className="border-t border-border pt-5">
            <h3 className="mb-4 font-sans text-sm font-semibold text-ink">
              {labels.sections.links}
            </h3>
            <Field label={labels.fields.links} help={labels.fields.linksHelp}>
              {(control) => (
                <Input
                  {...control}
                  name="links"
                  type="url"
                  defaultValue={values.links.join(", ")}
                />
              )}
            </Field>
          </div>
        </div>
      </Panel>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className={buttonClass()}>
          {labels.save}
        </button>
        {saved ? (
          <p role="status" className="text-sm font-semibold text-accent-ink">
            {labels.saved}
          </p>
        ) : null}
      </div>
    </form>
  );
}
