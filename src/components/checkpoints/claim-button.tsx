"use client";

import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useServerAction } from "@/hooks/use-server-action";
import { claimCheckpointAction } from "@/lib/checkpoints/actions";
import type { CheckpointKey } from "@/lib/checkpoints/checkpoints";
import { cn } from "@/lib/utils";

export type ClaimButtonLabels = {
  claim: string;
  claiming: string;
  claimed: string;
  accessible: string;
  success: string;
  error: string;
  notReached: string;
  unavailable: string;
  exhausted: string;
  photoRequired: string;
};

export function ClaimButton({
  checkpointKey,
  enabled,
  labels,
  size = "md",
  className,
}: {
  checkpointKey: CheckpointKey;
  enabled: boolean;
  labels: ClaimButtonLabels;
  size?: "sm" | "md";
  className?: string;
}) {
  const claim = useServerAction(() => claimCheckpointAction(checkpointKey), {
    onSuccess: () => toast.success(labels.success),
  });
  const error =
    claim.error?.result.code === "checkpointPhotoRequired"
      ? labels.photoRequired
      : claim.error?.result.code === "checkpointNotReached"
        ? labels.notReached
        : claim.error?.result.code === "checkpointRewardExhausted"
          ? labels.exhausted
          : claim.error?.result.code === "checkpointClaimsUnavailable"
            ? labels.unavailable
            : labels.error;

  return (
    <div className={cn("flex flex-col items-stretch gap-2 sm:items-end", className)}>
      <Button
        type="button"
        size={size}
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
        {claim.isPending || claim.isSuccess ? null : (
          <ArrowRight aria-hidden="true" className="size-4" />
        )}
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
