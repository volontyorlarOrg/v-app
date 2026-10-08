"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useServerAction } from "@/hooks/use-server-action";
import { claimCheckpointAction } from "@/lib/checkpoints/actions";
import type { CheckpointKey } from "@/lib/checkpoints/checkpoints";

export function ClaimButton({
  checkpointKey,
  enabled,
  labels,
}: {
  checkpointKey: CheckpointKey;
  enabled: boolean;
  labels: {
    claim: string;
    claiming: string;
    claimed: string;
    accessible: string;
    success: string;
    error: string;
    notReached: string;
    unavailable: string;
    exhausted: string;
  };
}) {
  const claim = useServerAction(() => claimCheckpointAction(checkpointKey), {
    onSuccess: () => toast.success(labels.success),
  });
  const error =
    claim.error?.result.code === "checkpointNotReached"
      ? labels.notReached
      : claim.error?.result.code === "checkpointRewardExhausted"
        ? labels.exhausted
        : claim.error?.result.code === "checkpointClaimsUnavailable"
          ? labels.unavailable
          : labels.error;

  return (
    <div className="mt-3 flex flex-col items-start gap-2">
      <Button
        type="button"
        size="sm"
        aria-label={labels.accessible}
        aria-busy={claim.isPending}
        disabled={
          !enabled ||
          claim.isPending ||
          claim.isSuccess ||
          claim.error?.result.code === "checkpointRewardExhausted"
        }
        onClick={() => claim.mutate()}
      >
        {claim.isPending
          ? labels.claiming
          : claim.isSuccess
            ? labels.claimed
            : labels.claim}
      </Button>
      {!enabled ? <p className="text-sm text-ink-muted">{labels.unavailable}</p> : null}
      {claim.isError ? (
        <p role="alert" className="text-sm text-ink-muted">
          {error}
        </p>
      ) : null}
    </div>
  );
}
