"use client";

import { Bookmark } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

export function SaveButton({
  saved,
  saveLabel,
  savedLabel,
  className,
}: {
  saved: boolean;
  saveLabel: string;
  savedLabel: string;
  className?: string;
}) {
  const [on, setOn] = useState(saved);

  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => setOn((value) => !value)}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors",
        on
          ? "bg-surface-soft text-primary-ink"
          : "text-ink-muted hover:bg-surface-sunk hover:text-ink",
        className,
      )}
    >
      <Bookmark aria-hidden="true" className={cn("size-4", on && "fill-current")} />
      {on ? savedLabel : saveLabel}
    </button>
  );
}
