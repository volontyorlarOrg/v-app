"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Confirmation for an action that cannot be undone.
 *
 * Takes rendered strings rather than translation keys because every caller is
 * already a Client Component with `t` in hand; baking a namespace into a shared
 * component would make it usable from exactly one place.
 *
 * Radix handles the focus trap, the escape key, the scroll lock, and the
 * `aria-modal` wiring — the parts of a dialog that are easy to get wrong and
 * invisible when you do.
 */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  pending = false,
  destructive = false,
}: {
  trigger: ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  pending?: boolean;
  destructive?: boolean;
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-night/80 backdrop-blur-sm" />

        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md",
            "-translate-x-1/2 -translate-y-1/2",
            "rounded-card border border-signal-line bg-panel p-6",
            "flex flex-col gap-4",
          )}
        >
          <Dialog.Title className="font-display text-lg font-semibold text-ink">
            {title}
          </Dialog.Title>

          <Dialog.Description className="text-sm leading-6 text-muted">
            {description}
          </Dialog.Description>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Dialog.Close asChild>
              <Button variant="secondary" disabled={pending}>
                {cancelLabel}
              </Button>
            </Dialog.Close>

            <Button
              variant={destructive ? "danger" : "primary"}
              onClick={onConfirm}
              disabled={pending}
            >
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
