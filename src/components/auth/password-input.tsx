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
        "flex w-full items-stretch overflow-hidden rounded-lg border border-input bg-surface transition-colors",
        "hover:border-primary-ink has-[input[aria-invalid]]:border-ink",
        "has-[input:focus-visible]:outline has-[input:focus-visible]:outline-[3px] has-[input:focus-visible]:outline-offset-[3px] has-[input:focus-visible]:outline-primary-ink",
        className,
      )}
    >
      <input
        {...props}
        type={visible ? "text" : "password"}
        className="min-h-12 w-full min-w-0 flex-1 bg-transparent px-4 text-base text-foreground caret-primary-ink placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-pressed={visible}
        aria-label={visible ? conceal : reveal}
        className="grid w-12 shrink-0 place-items-center text-ink-muted transition-colors hover:text-primary-ink"
      >
        <Icon aria-hidden="true" className="size-5" />
      </button>
    </div>
  );
}
