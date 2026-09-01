"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The form-field wrapper every input in the product goes through.
 *
 * It exists so accessibility is structural rather than remembered: the label
 * is always associated, help text and errors are always referenced by
 * `aria-describedby`, and `aria-invalid` is always set when there is an error.
 * A field built by hand tends to get one of those wrong.
 */

export type FieldProps = {
  label: string;
  children: (props: {
    id: string;
    "aria-describedby": string | undefined;
    "aria-invalid": boolean | undefined;
  }) => ReactNode;
  /** Translated message. Presence of this alone marks the field invalid. */
  error?: string | undefined;
  help?: string | undefined;
  required?: boolean;
  /** Translated word for "optional" — shown when a field is not required. */
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

  // Errors come first so a screen reader announces the problem before the
  // hint that is now less relevant.
  const describedBy =
    [error ? errorId : null, help ? helpId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-bold text-ink">
        {label}
        {!required && optionalLabel ? (
          <span className="ml-2 font-normal text-muted">({optionalLabel})</span>
        ) : null}
      </label>

      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
      })}

      {help ? (
        <p id={helpId} className="text-xs leading-5 text-muted">
          {help}
        </p>
      ) : null}

      {error ? (
        // `role="alert"` announces the message when it appears, which is what
        // makes a failed submit perceivable without sight.
        <p id={errorId} role="alert" className="text-xs font-bold text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const controlClasses = [
  "w-full rounded-lg border bg-night px-3 text-ink",
  "border-signal-line placeholder:text-muted",
  "transition-colors hover:border-teal/60",
  "aria-[invalid=true]:border-danger",
  "disabled:cursor-not-allowed disabled:opacity-60",
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
