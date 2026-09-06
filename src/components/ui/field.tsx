"use client";

import type { ComponentProps } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function FieldGroup({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn("group/field-group flex w-full flex-col gap-5", className)}
      {...props}
    />
  );
}

function Field({
  className,
  invalid = false,
  ...props
}: ComponentProps<"div"> & { invalid?: boolean }) {
  return (
    <div
      role="group"
      data-slot="field"
      data-invalid={invalid || undefined}
      className={cn("group/field flex w-full flex-col gap-2", className)}
      {...props}
    />
  );
}

function FieldLabel({ className, ...props }: ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn("w-fit group-data-[disabled=true]/field:opacity-60", className)}
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn("text-xs leading-5 text-muted-foreground", className)}
      {...props}
    />
  );
}

function FieldError({ className, children, ...props }: ComponentProps<"p">) {
  if (!children) return null;

  return (
    <p
      role="alert"
      data-slot="field-error"
      className={cn("text-sm text-foreground", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export { Field, FieldDescription, FieldError, FieldGroup, FieldLabel };
