"use client";

import { Bookmark } from "lucide-react";

import { useOptimisticServerAction } from "@/hooks/use-server-action";
import { setSavedAction } from "@/lib/opportunities/actions";
import { cn } from "@/lib/utils";

export function SaveButton({
  opportunityId,
  saved,
  saveLabel,
  savedLabel,
  errorLabel,
  className,
}: {
  opportunityId: string;
  saved: boolean;
  saveLabel: string;
  savedLabel: string;
  errorLabel: string;
  className?: string;
}) {
  const save = useOptimisticServerAction(saved, (next: boolean) =>
    setSavedAction(opportunityId, next),
  );

  return (
    <span className={cn("inline-flex flex-col items-start", className)}>
      <button
        type="button"
        aria-pressed={save.optimistic}
        disabled={save.isPending}
        onClick={() => save.mutate(!save.optimistic)}
        className={cn(
          "inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors disabled:opacity-70",
          save.optimistic
            ? "bg-surface-soft text-primary-ink"
            : "text-ink-muted hover:bg-surface-sunk hover:text-ink",
        )}
      >
        <Bookmark
          aria-hidden="true"
          className={cn("size-4", save.optimistic && "fill-current")}
        />
        {save.optimistic ? savedLabel : saveLabel}
      </button>
      {save.isError ? (
        <span role="alert" className="px-4 text-xs text-ink-muted">
          {errorLabel}
        </span>
      ) : null}
    </span>
  );
}
