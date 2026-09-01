"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Surface } from "@/components/ui/surface";
import { saveProfileAction } from "@/features/profile/actions";
import {
  profileSchema,
  type ProfileFormValues,
  type ProfileInput,
} from "@/features/profile/schemas";
import { REGIONS } from "@/features/opportunities/schemas";
import { useValidationMessage } from "@/lib/forms/use-validation-message";

/**
 * The reusable profile.
 *
 * Filled once and reused by every application, which is the whole reason the
 * product has a profile rather than asking for a school name eight times.
 *
 * Comma-separated text is used for languages and skills rather than a tag
 * widget: a custom chip input is a keyboard-accessibility liability, and a
 * plain text field with a clear hint is understood by everyone including a
 * screen-reader user on a phone.
 */
export function ProfileForm({ defaultValues }: { defaultValues: ProfileFormValues }) {
  const t = useTranslations("profile");
  const common = useTranslations("common");
  const errors = useTranslations("errors");
  const opportunities = useTranslations("opportunities");
  const messageFor = useValidationMessage();

  // Three generics, not one: the form holds the schema's *input* type while
  // the submit handler receives its *output* type, which `.default()` makes
  // different. Collapsing them makes the resolver type mismatch.
  const form = useForm<ProfileFormValues, unknown, ProfileInput>({
    resolver: zodResolver(profileSchema),
    mode: "onBlur",
    defaultValues,
  });

  const save = useAction(saveProfileAction, {
    onSuccess() {
      toast.success(t("save.success"));
      // Resets the dirty state so the unsaved-changes affordance clears.
      form.reset(form.getValues());
    },
    onError({ error }) {
      const code = error.serverError ?? "server";
      toast.error(errors(`${code}.title`), { description: errors(`${code}.body`) });
    },
  });

  const list = (value: string[] | undefined) => (value ?? []).join(", ");
  const parseList = (value: string) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  return (
    <form
      onSubmit={form.handleSubmit((values) => save.execute(values))}
      className="flex flex-col gap-6"
      noValidate
    >
      <Section title={t("sections.identity")}>
        <Controller
          name="fullName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              label={t("fields.fullName")}
              required
              error={messageFor(fieldState.error?.message, 120, 2)}
            >
              {(props) => <Input {...props} {...field} autoComplete="name" />}
            </Field>
          )}
        />

        <Controller
          name="bio"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              label={t("fields.bio")}
              help={t("fields.bioHelp")}
              optionalLabel={common("meta.optional")}
              error={messageFor(fieldState.error?.message, 600)}
            >
              {(props) => <Textarea {...props} {...field} rows={4} />}
            </Field>
          )}
        />
      </Section>

      <Section title={t("sections.education")}>
        <Controller
          name="school"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              label={t("fields.school")}
              optionalLabel={common("meta.optional")}
              error={messageFor(fieldState.error?.message, 160)}
            >
              {(props) => <Input {...props} {...field} autoComplete="organization" />}
            </Field>
          )}
        />

        <Controller
          name="gradeYear"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              label={t("fields.gradeYear")}
              optionalLabel={common("meta.optional")}
              error={messageFor(fieldState.error?.message, 40)}
            >
              {(props) => <Input {...props} {...field} />}
            </Field>
          )}
        />
      </Section>

      <Section title={t("sections.location")}>
        <Controller
          name="region"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              label={t("fields.region")}
              error={messageFor(fieldState.error?.message)}
            >
              {(props) => (
                <Select
                  {...props}
                  value={field.value ?? ""}
                  onChange={(event) => field.onChange(event.target.value || null)}
                >
                  <option value="">{opportunities("filters.regionAny")}</option>
                  {REGIONS.map((region) => (
                    <option key={region} value={region}>
                      {opportunities(`regions.${region}`)}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          )}
        />

        <Controller
          name="city"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              label={t("fields.city")}
              optionalLabel={common("meta.optional")}
              error={messageFor(fieldState.error?.message, 80)}
            >
              {(props) => (
                <Input {...props} {...field} autoComplete="address-level2" />
              )}
            </Field>
          )}
        />
      </Section>

      <Section title={t("sections.skills")}>
        <Controller
          name="languages"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              label={t("fields.languages")}
              help="O'zbekcha, Русский, English"
              error={messageFor(fieldState.error?.message)}
            >
              {(props) => (
                <Input
                  {...props}
                  value={list(field.value)}
                  onChange={(event) => field.onChange(parseList(event.target.value))}
                />
              )}
            </Field>
          )}
        />

        <Controller
          name="skills"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              label={t("fields.skills")}
              optionalLabel={common("meta.optional")}
              error={messageFor(fieldState.error?.message)}
            >
              {(props) => (
                <Input
                  {...props}
                  value={list(field.value)}
                  onChange={(event) => field.onChange(parseList(event.target.value))}
                />
              )}
            </Field>
          )}
        />
      </Section>

      <Section title={t("sections.contact")}>
        <Controller
          name="phone"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              label={t("fields.phone")}
              help={t("fields.phoneHelp")}
              optionalLabel={common("meta.optional")}
              error={messageFor(fieldState.error?.message)}
            >
              {(props) => (
                <Input
                  {...props}
                  {...field}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+998901234567"
                />
              )}
            </Field>
          )}
        />

        <Controller
          name="telegram"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              label={t("fields.telegram")}
              optionalLabel={common("meta.optional")}
              error={messageFor(fieldState.error?.message)}
            >
              {(props) => <Input {...props} {...field} placeholder="username" />}
            </Field>
          )}
        />
      </Section>

      <div className="flex items-center justify-between gap-4 border-t border-signal-line pt-6">
        <p aria-live="polite" className="text-xs text-muted">
          {form.formState.isDirty ? common("state.unsaved") : ""}
        </p>

        <Button type="submit" size="lg" disabled={save.isPending}>
          {save.isPending ? common("state.saving") : common("action.save")}
        </Button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Surface as="section" padding="md" className="flex flex-col gap-4">
      <h2 className="font-display text-base font-semibold text-ink">{title}</h2>
      {children}
    </Surface>
  );
}
