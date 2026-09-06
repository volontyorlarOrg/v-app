"use client";

import { Switch } from "@/components/ui/switch";
import { useOptimisticServerAction } from "@/hooks/use-server-action";
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
  const update = useOptimisticServerAction(item.checked, (next: boolean) =>
    updatePreferenceAction(item.key, next),
  );

  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <Switch
        label={item.label}
        description={item.description}
        checked={update.optimistic}
        disabled={update.isPending}
        onCheckedChange={(next) => update.mutate(next)}
      />
      {update.isError ? (
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
