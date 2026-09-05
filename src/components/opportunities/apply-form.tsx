"use client";

import { useActionState } from "react";

import { ActionStatus } from "@/components/app/action-status";
import { buttonClass } from "@/components/ui/button";
import { idleResult } from "@/lib/api/action-result";
import { applyAction } from "@/lib/opportunities/actions";

export type ApplyLabels = {
  apply: string;
  applying: string;
  errors: Record<string, string>;
  fallback: string;
};

export function ApplyForm({
  opportunityId,
  labels,
}: {
  opportunityId: string;
  labels: ApplyLabels;
}) {
  const [result, action, pending] = useActionState(applyAction, idleResult);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="opportunityId" value={opportunityId} />
      <button
        type="submit"
        disabled={pending}
        className={buttonClass({ className: "w-full disabled:opacity-70" })}
      >
        {pending ? labels.applying : labels.apply}
      </button>
      {result.status === "error" ? (
        <ActionStatus tone="error">
          {labels.errors[result.code] ?? labels.fallback}
        </ActionStatus>
      ) : null}
    </form>
  );
}
