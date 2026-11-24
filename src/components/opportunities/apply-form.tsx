"use client";

import { useState } from "react";

import { ActionStatus } from "@/components/app/action-status";
import {
  PlaceCheckDialog,
  type PlaceCheckData,
} from "@/components/profile/place-check-dialog";
import { Button } from "@/components/ui/button";
import { useActionForm } from "@/hooks/use-action-form";
import { applyAction } from "@/lib/opportunities/actions";
import { applyFormSchema } from "@/lib/opportunities/apply";

export type ApplyLabels = {
  apply: string;
  applying: string;
  hint: string;
  errors: Record<string, string>;
  fallback: string;
  profileLink: { href: string; label: string };
};

const PROFILE_ERRORS = new Set(["profileRequired", "profileIncomplete"]);

export function ApplyForm({
  opportunityId,
  labels,
  placeCheck,
}: {
  opportunityId: string;
  labels: ApplyLabels;
  placeCheck?: PlaceCheckData;
}) {
  const { form, formRef, result, pending, formProps } = useActionForm({
    schema: applyFormSchema,
    defaultValues: { opportunityId },
    action: applyAction,
  });
  const [checking, setChecking] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const mustConfirm = placeCheck !== undefined && !confirmed;

  return (
    <>
      <form {...formProps} className="flex flex-col gap-3">
        <input
          type="hidden"
          {...form.register("opportunityId")}
          defaultValue={opportunityId}
        />
        <Button
          type={mustConfirm ? "button" : "submit"}
          disabled={pending}
          onClick={mustConfirm ? () => setChecking(true) : undefined}
          className="w-full disabled:opacity-70"
        >
          {pending ? labels.applying : labels.apply}
        </Button>
        {result.status === "error" ? (
          <ActionStatus tone="error">
            {labels.errors[result.code] ?? labels.fallback}
            {PROFILE_ERRORS.has(result.code) ? (
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
        ) : (
          <p className="text-sm leading-relaxed text-ink-muted">{labels.hint}</p>
        )}
      </form>
      {placeCheck ? (
        <PlaceCheckDialog
          open={checking}
          onOpenChange={setChecking}
          data={placeCheck}
          onConfirmed={() => {
            setConfirmed(true);
            formRef.current?.requestSubmit();
          }}
        />
      ) : null}
    </>
  );
}
