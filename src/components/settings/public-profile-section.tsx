"use client";

import { useState, useTransition } from "react";

import { ActionStatus } from "@/components/app/action-status";
import { Switch } from "@/components/ui/switch";
import { setPublicProfileAction } from "@/lib/account/actions";

export type PublicProfileLabels = {
  label: string;
  description: string;
  visible: string;
  hidden: string;
  error: string;
};

export function PublicProfileSection({
  initialEnabled,
  labels,
}: {
  initialEnabled: boolean;
  labels: PublicProfileLabels;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [pending, startTransition] = useTransition();

  function change(next: boolean) {
    const previous = enabled;
    setEnabled(next);
    setStatus("idle");
    startTransition(async () => {
      const result = await setPublicProfileAction(next);
      if (result.status === "ok") {
        setStatus("saved");
        return;
      }
      setEnabled(previous);
      setStatus("error");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Switch
        label={labels.label}
        description={labels.description}
        checked={enabled}
        disabled={pending}
        onCheckedChange={change}
      />
      <div aria-live="polite">
        {status === "saved" ? (
          <ActionStatus tone="done">
            {enabled ? labels.visible : labels.hidden}
          </ActionStatus>
        ) : null}
        {status === "error" ? (
          <ActionStatus tone="error">{labels.error}</ActionStatus>
        ) : null}
      </div>
    </div>
  );
}
