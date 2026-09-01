"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type FieldProps = {
  label: string;
  children: (props: {
    id: string;
    "aria-describedby": string | undefined;
    "aria-invalid": boolean | undefined;
  }) => ReactNode;
  error?: string | undefined;
  help?: string | undefined;
  required?: boolean;
  optionalLabel?: string | undefined;
  className?: string;
};

export function Field({
  label,
  children,
  error,
  help,
  required = false,
  optionalLabel,
  className,
}: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;

  const describedBy =
    [error ? errorId : null, help ? helpId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
        {!required && optionalLabel ? (
          <span className="ml-2 font-normal text-ink-muted">({optionalLabel})</span>
        ) : null}
      </label>

      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
      })}

      {help ? (
        <p id={helpId} className="text-xs leading-5 text-ink-muted">
          {help}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} role="alert" className="text-xs font-semibold text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const controlClasses = [
  "w-full rounded-lg border bg-canvas px-3 text-ink",
  "border-line-control placeholder:text-ink-muted",
  "transition-colors hover:border-blue-deep",
  "aria-[invalid=true]:border-danger",
  "disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-70",
].join(" ");

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(controlClasses, "h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(controlClasses, "min-h-32 resize-y py-2.5 leading-7", className)}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select className={cn(controlClasses, "h-11", className)} {...props}>
      {children}
    </select>
  );
}
