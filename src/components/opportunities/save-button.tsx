"use client";

import { Bookmark } from "lucide-react";
import { useOptimistic, useState, useTransition } from "react";

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
  const [optimistic, setOptimistic] = useOptimistic(saved);
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  function toggle() {
    const next = !optimistic;
    setFailed(false);
    startTransition(async () => {
      setOptimistic(next);
      const result = await setSavedAction(opportunityId, next);
      if (result.status !== "ok") setFailed(true);
    });
  }

  return (
    <span className={cn("inline-flex flex-col items-start", className)}>
      <button
        type="button"
        aria-pressed={optimistic}
        disabled={pending}
        onClick={toggle}
        className={cn(
          "inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors disabled:opacity-70",
          optimistic
            ? "bg-surface-soft text-primary-ink"
            : "text-ink-muted hover:bg-surface-sunk hover:text-ink",
        )}
      >
        <Bookmark
          aria-hidden="true"
          className={cn("size-4", optimistic && "fill-current")}
        />
        {optimistic ? savedLabel : saveLabel}
      </button>
      {failed ? (
        <span role="alert" className="px-4 text-xs text-ink-muted">
          {errorLabel}
        </span>
      ) : null}
    </span>
  );
}
