"use client";

import { Switch } from "@/components/ui/switch";

export type PreferenceItem = {
  key: string;
  label: string;
  description: string;
  defaultChecked: boolean;
};

export function PreferenceSwitches({ items }: { items: readonly PreferenceItem[] }) {
  return (
    <div className="divide-y divide-border">
      {items.map((item) => (
        <div key={item.key} className="py-3 first:pt-0 last:pb-0">
          <Switch
            label={item.label}
            description={item.description}
            defaultChecked={item.defaultChecked}
          />
        </div>
      ))}
    </div>
  );
}
