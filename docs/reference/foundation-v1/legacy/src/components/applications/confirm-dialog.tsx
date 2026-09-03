"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm" />

        <Dialog.Content
          className={cn(
            "fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md",
            "-translate-x-1/2 -translate-y-1/2",
            "rounded-card border border-line bg-surface p-6",
            "flex flex-col gap-4",
          )}
        >
          <Dialog.Title className="text-lg font-semibold text-ink">
            {title}
          </Dialog.Title>

          <Dialog.Description className="text-sm leading-6 text-ink-muted">
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
