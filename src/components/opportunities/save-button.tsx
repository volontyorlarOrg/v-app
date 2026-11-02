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
            "inline-flex size-11 items-center justify-center rounded-lg border backdrop-blur-sm transition-colors disabled:opacity-70",
            save.optimistic
              ? "border-accent bg-accent text-knockout"
              : "border-border bg-surface/85 text-ink hover:bg-surface hover:text-primary-ink",
          )}
        >
          <Bookmark
            aria-hidden="true"
            className={cn("size-5", save.optimistic && "fill-current")}
          />
        </button>
        {save.isError ? (
          <span
            role="alert"
            className="mt-1.5 rounded-md bg-surface px-2 py-1 text-xs font-medium whitespace-nowrap text-ink-muted shadow-raised"
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
