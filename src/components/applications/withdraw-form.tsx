"use client";

import { useActionState, useState } from "react";

import { ActionStatus } from "@/components/app/action-status";
import { buttonClass } from "@/components/ui/button";
import { idleResult } from "@/lib/api/action-result";
import { withdrawApplicationAction } from "@/lib/applications/actions";

export type WithdrawLabels = {
  withdraw: string;
  confirm: string;
  yes: string;
  withdrawing: string;
  cancel: string;
  errors: Record<string, string>;
  fallback: string;
};

export function WithdrawForm({
  applicationId,
  labels,
}: {
  applicationId: string;
  labels: WithdrawLabels;
}) {
  const [confirming, setConfirming] = useState(false);
  const [result, action, pending] = useActionState(withdrawApplicationAction, idleResult);

  return (
    <div className="flex flex-col gap-4">
      {confirming ? (
        <form action={action} className="flex flex-col gap-3">
          <input type="hidden" name="applicationId" value={applicationId} />
          <p className="text-sm leading-relaxed text-ink">{labels.confirm}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={pending}
              className={buttonClass({ size: "sm", className: "disabled:opacity-70" })}
            >
              {pending ? labels.withdrawing : labels.yes}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => setConfirming(false)}
              className={buttonClass({ variant: "ghost", size: "sm" })}
            >
              {labels.cancel}
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className={buttonClass({ variant: "outline", className: "w-full" })}
        >
          {labels.withdraw}
        </button>
      )}
      {result.status === "error" ? (
        <ActionStatus tone="error">
          {labels.errors[result.code] ?? labels.fallback}
        </ActionStatus>
      ) : null}
    </div>
  );
}
