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
  variant = "pill",
  className,
}: {
  opportunityId: string;
  saved: boolean;
  saveLabel: string;
  savedLabel: string;
  errorLabel: string;
  variant?: "pill" | "icon";
  className?: string;
}) {
  const save = useOptimisticServerAction(saved, (next: boolean) =>
    setSavedAction(opportunityId, next),
  );

  if (variant === "icon") {
    return (
      <span className={cn("relative inline-flex flex-col items-end", className)}>
        <button
          type="button"
          aria-pressed={save.optimistic}
          aria-label={save.optimistic ? savedLabel : saveLabel}
          title={save.optimistic ? savedLabel : saveLabel}
          disabled={save.isPending}
          onClick={() => save.mutate(!save.optimistic)}
          className={cn(
            "inline-flex size-(--control-sm) items-center justify-center rounded-md bg-surface transition-colors hover:bg-surface-sunk disabled:opacity-50",
            save.optimistic ? "text-accent" : "text-ink-muted hover:text-ink",
          )}
        >
          <Bookmark
            aria-hidden="true"
            className={cn("size-4", save.optimistic && "fill-current")}
          />
        </button>
        {save.isError ? (
          <span
            role="alert"
            className="mt-1 rounded-sm bg-surface px-1.5 py-0.5 text-xs whitespace-nowrap text-ink-muted shadow-raised"
          >
            {errorLabel}
          </span>
        ) : null}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex flex-col items-start", className)}>
      <button
        type="button"
        aria-pressed={save.optimistic}
        disabled={save.isPending}
        onClick={() => save.mutate(!save.optimistic)}
        className={cn(
          "inline-flex min-h-(--control-sm) items-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-colors disabled:opacity-50",
          save.optimistic
            ? "bg-surface-soft text-primary"
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
        <span role="alert" className="px-2.5 text-xs text-ink-muted">
          {errorLabel}
        </span>
      ) : null}
    </span>
  );
}
