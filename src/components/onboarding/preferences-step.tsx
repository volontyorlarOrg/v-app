"use client";

import { useState, type FormEvent } from "react";

import { ActionStatus } from "@/components/app/action-status";
import {
  ONBOARDING_PREFERENCE_KEYS,
  type OnboardingLabels,
  type OnboardingPreferenceKey,
} from "@/components/onboarding/labels";
import { StepActions } from "@/components/onboarding/profile-step-form";
import { Switch } from "@/components/ui/switch";
import { useServerAction } from "@/hooks/use-server-action";
import { updatePreferencesAction } from "@/lib/account/actions";
import type { Preferences } from "@/lib/account/types";

export type OnboardingPreferences = Pick<Preferences, OnboardingPreferenceKey>;

export function PreferencesStep({
  values,
  labels,
  onSaved,
  onSkip,
  onBack,
}: {
  values: OnboardingPreferences;
  labels: OnboardingLabels;
  onSaved: (preferences: OnboardingPreferences) => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  const [draft, setDraft] = useState(values);
  const save = useServerAction(
    (input: OnboardingPreferences) => updatePreferencesAction(input),
    { onSuccess: (_result, input) => onSaved(input) },
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    save.mutate(draft);
  }

  return (
    <form onSubmit={submit} className="mt-6">
      <div className="divide-y divide-border">
        {ONBOARDING_PREFERENCE_KEYS.map((key) => (
          <div key={key} className="py-3 first:pt-0 last:pb-0">
            <Switch
              label={labels.preferences[key].label}
              description={labels.preferences[key].description}
              checked={draft[key]}
              disabled={save.isPending}
              onCheckedChange={(next) =>
                setDraft((current) => ({ ...current, [key]: next }))
              }
            />
          </div>
        ))}
      </div>

      {save.isError ? (
        <ActionStatus tone="error" className="mt-5">
          {labels.saveError}
        </ActionStatus>
      ) : null}

      <StepActions
        pending={save.isPending}
        labels={labels}
        onSkip={onSkip}
        onBack={onBack}
      />
    </form>
  );
}
