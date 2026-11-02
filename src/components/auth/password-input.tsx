"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, type ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function PasswordInput({
  reveal,
  conceal,
  className,
  ...props
}: Omit<ComponentProps<"input">, "type"> & { reveal: string; conceal: string }) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;

  return (
    <div
      data-slot="password-input"
      className={cn(
        "flex w-full items-stretch overflow-hidden rounded-md border border-input bg-field transition-colors",
        "hover:border-ink-muted has-[input[aria-invalid]]:border-ink",
        "has-[input:focus-visible]:outline has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-0 has-[input:focus-visible]:outline-primary",
        className,
      )}
    >
      <input
        {...props}
        type={visible ? "text" : "password"}
        className="min-h-(--control) w-full min-w-0 flex-1 bg-transparent px-3 text-base text-foreground caret-primary placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-pressed={visible}
        aria-label={visible ? conceal : reveal}
        className="grid w-10 shrink-0 place-items-center text-ink-muted transition-colors hover:text-ink"
      >
        <Icon aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}
