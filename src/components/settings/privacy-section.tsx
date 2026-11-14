"use client";

import { useState, useTransition } from "react";

import { ActionStatus } from "@/components/app/action-status";
import { Switch } from "@/components/ui/switch";
import { Link } from "@/i18n/navigation";
import type { LegalChoice } from "@/lib/legal/constants";
import { setLegalChoiceAction } from "@/lib/legal/actions";

type ChoiceLabels = { label: string; description: string; on: string; off: string };

export type PrivacyLabels = {
  publicProfile: ChoiceLabels;
  leaderboard: ChoiceLabels;
  error: string;
  dataLink: string;
};

function ConsentSwitch({
  choice,
  initialEnabled,
  labels,
  error,
}: {
  choice: LegalChoice;
  initialEnabled: boolean;
  labels: ChoiceLabels;
  error: string;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [pending, startTransition] = useTransition();

  function change(next: boolean) {
    const previous = enabled;
    setEnabled(next);
    setStatus("idle");
    startTransition(async () => {
      const result = await setLegalChoiceAction(choice, next);
      if (result.status === "ok") {
        setStatus("saved");
        return;
      }
      setEnabled(previous);
      setStatus("error");
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <Switch
        label={labels.label}
        description={labels.description}
        checked={enabled}
        disabled={pending}
        onCheckedChange={change}
      />
      <div aria-live="polite">
        {status === "saved" ? (
          <ActionStatus tone="done">{enabled ? labels.on : labels.off}</ActionStatus>
        ) : null}
        {status === "error" ? <ActionStatus tone="error">{error}</ActionStatus> : null}
      </div>
    </div>
  );
}

export function PrivacySection({
  publicProfile,
  leaderboard,
  labels,
}: {
  publicProfile: boolean;
  leaderboard: boolean;
  labels: PrivacyLabels;
}) {
  return (
    <div className="flex flex-col gap-4">
      <ConsentSwitch
        choice="publicProfile"
        initialEnabled={publicProfile}
        labels={labels.publicProfile}
        error={labels.error}
      />
      <ConsentSwitch
        choice="leaderboard"
        initialEnabled={leaderboard}
        labels={labels.leaderboard}
        error={labels.error}
      />
      <Link
        href="/consent"
        className="text-sm text-primary-ink underline underline-offset-4"
      >
        {labels.dataLink}
      </Link>
    </div>
  );
}
