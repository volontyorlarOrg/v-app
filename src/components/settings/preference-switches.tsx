"use client";

import { useOptimistic, useState, useTransition } from "react";

import { Switch } from "@/components/ui/switch";
import { updatePreferenceAction } from "@/lib/account/actions";
import type { PreferenceKey } from "@/lib/account/types";

export type PreferenceItem = {
  key: PreferenceKey;
  label: string;
  description: string;
  checked: boolean;
};

function PreferenceSwitch({
  item,
  errorLabel,
}: {
  item: PreferenceItem;
  errorLabel: string;
}) {
  const [optimistic, setOptimistic] = useOptimistic(item.checked);
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  function onChange(next: boolean) {
    setFailed(false);
    startTransition(async () => {
      setOptimistic(next);
      const result = await updatePreferenceAction(item.key, next);
      if (result.status !== "ok") setFailed(true);
    });
  }

  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <Switch
        label={item.label}
        description={item.description}
        checked={optimistic}
        disabled={pending}
        onCheckedChange={onChange}
      />
      {failed ? (
        <p role="alert" className="mt-1 text-xs text-ink-muted">
          {errorLabel}
        </p>
      ) : null}
    </div>
  );
}

export function PreferenceSwitches({
  items,
  errorLabel,
}: {
  items: readonly PreferenceItem[];
  errorLabel: string;
}) {
  return (
    <div className="divide-y divide-border">
      {items.map((item) => (
        <PreferenceSwitch key={item.key} item={item} errorLabel={errorLabel} />
      ))}
    </div>
  );
}
