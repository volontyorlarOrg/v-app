import { ChevronDown } from "lucide-react";
import { useId, type ComponentProps, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export type FieldControlProps = {
  id: string;
  "aria-describedby": string | undefined;
  role?: "group";
  "aria-labelledby"?: string;
};

export const controlClass =
  "min-h-12 w-full rounded-lg border border-border-control bg-surface px-4 text-base text-ink transition-colors hover:border-primary-ink disabled:opacity-60";

export function Field({
  label,
  help,
  trailing,
  group = false,
  className,
  children,
}: {
  label: string;
  help?: string;
  trailing?: ReactNode;
  group?: boolean;
  className?: string;
  children: (control: FieldControlProps) => ReactNode;
}) {
  const id = useId();
  const helpId = `${id}-help`;
  const labelId = `${id}-label`;
  const describedBy = help ? helpId : undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-4">
        {group ? (
          <span id={labelId} className="text-sm font-semibold text-ink">
            {label}
          </span>
        ) : (
          <label htmlFor={id} className="text-sm font-semibold text-ink">
            {label}
          </label>
        )}
        {trailing}
      </div>
      {children(
        group
          ? {
              id,
              "aria-describedby": describedBy,
              role: "group",
              "aria-labelledby": labelId,
            }
          : { id, "aria-describedby": describedBy },
      )}
      {help ? (
        <p id={helpId} className="text-xs leading-5 text-ink-muted">
          {help}
        </p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(controlClass, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(controlClass, "min-h-32 resize-y py-3 leading-relaxed", className)}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <span className="relative block">
      <select
        className={cn(controlClass, "appearance-none pr-11", className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-ink-muted"
      />
    </span>
  );
}
