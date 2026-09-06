"use client";

import type { ComponentProps, CSSProperties } from "react";
import { Progress as ProgressPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function Progress({
  className,
  value,
  max = 100,
  valueText,
  ...props
}: Omit<ComponentProps<typeof ProgressPrimitive.Root>, "getValueLabel"> & {
  valueText?: string;
}) {
  const fraction = max > 0 ? Math.min(Math.max(value ?? 0, 0), max) / max : 0;

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      max={max}
      getValueLabel={valueText === undefined ? undefined : () => valueText}
      className={cn("meter", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="meter-fill"
        style={{ "--meter-progress": fraction } as CSSProperties}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
