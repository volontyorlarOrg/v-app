"use client";

import { useId, useState } from "react";

import { cn } from "@/lib/utils";

export function Switch({
  label,
  description,
  name,
  checked,
  defaultChecked = false,
  disabled = false,
  onCheckedChange,
  className,
}: {
  label: string;
  description?: string;
  name?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}) {
  const id = useId();
  const [internal, setInternal] = useState(defaultChecked);
  const on = checked ?? internal;

  function toggle() {
    const next = !on;
    if (checked === undefined) setInternal(next);
    onCheckedChange?.(next);
  }

  return (
    <div className="flex items-center">
      {name && on ? <input type="hidden" name={name} value="1" /> : null}
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-labelledby={`${id}-label`}
        aria-describedby={description ? `${id}-description` : undefined}
        disabled={disabled}
        onClick={toggle}
        className={cn(
          "flex min-h-11 w-full items-center justify-between gap-4 text-left disabled:opacity-50",
          className,
        )}
      >
        <span className="min-w-0">
          <span id={`${id}-label`} className="block text-sm font-semibold text-ink">
            {label}
          </span>
          {description ? (
            <span
              id={`${id}-description`}
              className="mt-0.5 block text-sm text-ink-muted"
            >
              {description}
            </span>
          ) : null}
        </span>
        <span aria-hidden="true" className="inline-flex shrink-0 items-center px-1">
          <span
            className={cn(
              "relative inline-flex h-7 w-12 items-center rounded-full border transition-colors",
              on ? "border-action bg-action" : "border-border-control bg-surface-sunk",
            )}
          >
            <span
              className={cn(
                "absolute left-0.5 size-5 rounded-full bg-knockout ring-1 ring-border-control/40 transition-transform",
                on && "translate-x-5",
              )}
            />
          </span>
        </span>
      </button>
    </div>
  );
}
