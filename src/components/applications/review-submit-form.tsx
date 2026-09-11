"use client";

import { ActionStatus } from "@/components/app/action-status";
import { Button } from "@/components/ui/button";
import { useActionForm } from "@/hooks/use-action-form";
import { submitApplicationAction } from "@/lib/applications/actions";
import { confirmSubmissionSchema } from "@/lib/applications/confirm";

export type ReviewSubmitLabels = {
  confirm: string;
  confirmRequired: string;
  submit: string;
  submitting: string;
  errors: Record<string, string>;
  fallback: string;
  profileLink: { href: string; label: string };
};

export function ReviewSubmitForm({
  applicationId,
  labels,
}: {
  applicationId: string;
  labels: ReviewSubmitLabels;
}) {
  const { form, result, pending, formProps } = useActionForm({
    schema: confirmSubmissionSchema,
    defaultValues: { applicationId, confirmed: false },
    action: submitApplicationAction,
  });

  const invalid = form.formState.errors.confirmed !== undefined;

  return (
    <form {...formProps} className="flex flex-col gap-5">
      <input
        type="hidden"
        {...form.register("applicationId")}
        defaultValue={applicationId}
      />

      <label className="flex min-h-11 items-start gap-3 text-sm leading-relaxed text-ink">
        <input
          type="checkbox"
          {...form.register("confirmed")}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? "confirm-error" : undefined}
          className="mt-0.5 size-5 shrink-0 accent-action"
        />
        <span>{labels.confirm}</span>
      </label>

      {invalid ? (
        <p id="confirm-error" role="alert" className="text-sm text-ink">
          {labels.confirmRequired}
        </p>
      ) : null}

      <div>
        <Button type="submit" disabled={pending} className="disabled:opacity-70">
          {pending ? labels.submitting : labels.submit}
        </Button>
      </div>

      {result.status === "error" ? (
        <ActionStatus tone="error">
          {labels.errors[result.code] ?? labels.fallback}
          {result.code === "profileIncomplete" || result.code === "profileRequired" ? (
            <>
              {" "}
              <a
                href={labels.profileLink.href}
                className="font-semibold text-primary-ink underline-offset-4 hover:underline"
              >
                {labels.profileLink.label}
              </a>
            </>
          ) : null}
        </ActionStatus>
      ) : null}
    </form>
  );
}
