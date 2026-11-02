"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { useId, useState, type ComponentProps } from "react";
import { Switch as SwitchPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

const switchVariants = cva(
  "group/switch inline-flex shrink-0 items-center outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        track: "-my-2 h-11 px-1",
        row: "min-h-11 w-full justify-between gap-4 text-left",
        icon: "",
      },
    },
    defaultVariants: {
      variant: "track",
    },
  },
);

function SwitchTrack() {
  return (
    <span
      aria-hidden="true"
      data-slot="switch-track"
      className="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors group-data-[state=checked]/switch:border-action group-data-[state=checked]/switch:bg-action group-data-[state=unchecked]/switch:border-input group-data-[state=unchecked]/switch:bg-muted"
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-5 rounded-full bg-knockout ring-1 ring-input/40 transition-transform data-[state=checked]:translate-x-[1.375rem] data-[state=unchecked]:translate-x-0.5"
      />
    </span>
  );
}

function SwitchControl({
  className,
  variant,
  children,
  ...props
}: ComponentProps<typeof SwitchPrimitive.Root> & VariantProps<typeof switchVariants>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(switchVariants({ variant }), className)}
      {...props}
    >
      {variant === "icon" ? (
        children
      ) : (
        <>
          {variant === "row" ? children : null}
          <SwitchTrack />
        </>
      )}
    </SwitchPrimitive.Root>
  );
}

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

  function toggle(next: boolean) {
    if (checked === undefined) setInternal(next);
    onCheckedChange?.(next);
  }

  return (
    <div className={cn("flex w-full items-center", className)}>
      {name && on ? <input type="hidden" name={name} value="1" /> : null}
      <SwitchControl
        variant="row"
        checked={on}
        onCheckedChange={toggle}
        disabled={disabled}
        aria-labelledby={`${id}-label`}
        aria-describedby={description ? `${id}-description` : undefined}
      >
        <span className="min-w-0">
          <span id={`${id}-label`} className="block text-sm font-semibold text-ink">
            {label}
          </span>
          {description ? (
            <span id={`${id}-description`} className="mt-0.5 block text-sm text-ink-muted">
              {description}
            </span>
          ) : null}
        </span>
      </SwitchControl>
    </div>
  );
}

export { SwitchControl, switchVariants };
