"use client";

import { useActionState } from "react";

import { ActionStatus } from "@/components/app/action-status";
import { Panel } from "@/components/app/panel";
import { buttonClass } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { idleResult, type ActionResult } from "@/lib/api/action-result";
import { updateProfileAction } from "@/lib/profile/actions";
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
  saving: string;
  saved: string;
  saveError: string;
  fieldInvalid: string;
};

function FieldError({ result, name, label }: { result: ActionResult; name: string; label: string }) {
  if (result.status !== "error" || !result.fields[name]) return null;
  return (
    <p role="alert" className="mt-1.5 text-sm text-ink">
      {label}
    </p>
  );
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
  const [result, action, pending] = useActionState(updateProfileAction, idleResult);
  const invalid = (name: string) =>
    result.status === "error" && result.fields[name] ? true : undefined;

  return (
    <form action={action} className="flex flex-col gap-6">
      <Panel title={labels.sections.identity}>
        <div className="flex flex-col gap-5">
          <Field label={labels.fields.fullName}>
            {(control) => (
              <div>
                <Input
                  {...control}
                  name="fullName"
                  defaultValue={values.fullName}
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={120}
                  aria-invalid={invalid("fullName")}
                />
                <FieldError result={result} name="fullName" label={labels.fieldInvalid} />
              </div>
            )}
          </Field>
          <Field label={labels.fields.bio} help={labels.fields.bioHelp}>
            {(control) => (
              <div>
                <Textarea
                  {...control}
                  name="bio"
                  defaultValue={values.bio}
                  maxLength={600}
                  aria-invalid={invalid("bio")}
                />
                <FieldError result={result} name="bio" label={labels.fieldInvalid} />
              </div>
            )}
          </Field>
          <div className="border-t border-border pt-5">
            <h3 className="mb-4 font-sans text-sm font-semibold text-ink">
              {labels.sections.education}
            </h3>
            <div className="grid gap-5 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <Field label={labels.fields.school}>
                {(control) => (
                  <div>
                    <Input
                      {...control}
                      name="school"
                      defaultValue={values.school}
                      maxLength={160}
                      aria-invalid={invalid("school")}
                    />
                    <FieldError result={result} name="school" label={labels.fieldInvalid} />
                  </div>
                )}
              </Field>
              <Field label={labels.fields.gradeYear}>
                {(control) => (
                  <div>
                    <Input
                      {...control}
                      name="gradeYear"
                      defaultValue={values.gradeYear}
                      maxLength={40}
                      aria-invalid={invalid("gradeYear")}
                    />
                    <FieldError result={result} name="gradeYear" label={labels.fieldInvalid} />
                  </div>
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
                  <div>
                    <Input
                      {...control}
                      name="city"
                      defaultValue={values.city}
                      maxLength={80}
                      aria-invalid={invalid("city")}
                    />
                    <FieldError result={result} name="city" label={labels.fieldInvalid} />
                  </div>
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
              <div>
                <Input
                  {...control}
                  name="languages"
                  defaultValue={values.languages.join(", ")}
                  aria-invalid={invalid("languages")}
                />
                <FieldError result={result} name="languages" label={labels.fieldInvalid} />
              </div>
            )}
          </Field>
          <Field label={labels.fields.skills} help={labels.fields.skillsHelp}>
            {(control) => (
              <div>
                <Input
                  {...control}
                  name="skills"
                  defaultValue={values.skills.join(", ")}
                  aria-invalid={invalid("skills")}
                />
                <FieldError result={result} name="skills" label={labels.fieldInvalid} />
              </div>
            )}
          </Field>
        </div>
      </Panel>

      <Panel title={labels.sections.contact}>
        <div className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={labels.fields.phone} help={labels.fields.phoneHelp}>
              {(control) => (
                <div>
                  <Input
                    {...control}
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    defaultValue={values.phone}
                    aria-invalid={invalid("phone")}
                  />
                  <FieldError result={result} name="phone" label={labels.fieldInvalid} />
                </div>
              )}
            </Field>
            <Field label={labels.fields.telegram} help={labels.fields.telegramHelp}>
              {(control) => (
                <div>
                  <Input
                    {...control}
                    name="telegram"
                    defaultValue={values.telegram}
                    aria-invalid={invalid("telegram")}
                  />
                  <FieldError result={result} name="telegram" label={labels.fieldInvalid} />
                </div>
              )}
            </Field>
          </div>
          <div className="border-t border-border pt-5">
            <h3 className="mb-4 font-sans text-sm font-semibold text-ink">
              {labels.sections.links}
            </h3>
            <Field label={labels.fields.links} help={labels.fields.linksHelp}>
              {(control) => (
                <div>
                  <Input
                    {...control}
                    name="links"
                    defaultValue={values.links.join(", ")}
                    aria-invalid={invalid("links")}
                  />
                  <FieldError result={result} name="links" label={labels.fieldInvalid} />
                </div>
              )}
            </Field>
          </div>
        </div>
      </Panel>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className={buttonClass({ className: "disabled:opacity-70" })}
        >
          {pending ? labels.saving : labels.save}
        </button>
        {result.status === "ok" ? (
          <ActionStatus tone="done">{labels.saved}</ActionStatus>
        ) : result.status === "error" ? (
          <ActionStatus tone="error">{labels.saveError}</ActionStatus>
        ) : null}
      </div>
    </form>
  );
}
