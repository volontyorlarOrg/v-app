import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export const inputClass =
  "min-h-(--control) w-full min-w-0 rounded-md border border-input bg-field px-3 text-base text-foreground caret-primary transition-colors placeholder:text-muted-foreground hover:border-ink-muted focus-visible:outline-offset-0 aria-invalid:border-ink disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm";

function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputClass, className)}
      {...props}
    />
  );
}

export { Input };
