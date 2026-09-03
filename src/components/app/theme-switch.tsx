"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";

import { Switch } from "@/components/ui/switch";
import {
  applyTheme,
  readTheme,
  restorePreferences,
  subscribeToTheme,
  type Theme,
} from "@/lib/theme";

const SERVER_THEME: Theme = "light";

export function ThemeSwitch({
  label,
  description,
}: {
  label: string;
  description?: string;
}) {
  const dark =
    useSyncExternalStore(subscribeToTheme, readTheme, () => SERVER_THEME) === "dark";

  useLayoutEffect(() => {
    restorePreferences();
  }, []);

  return (
    <Switch
      label={label}
      description={description}
      checked={dark}
      onCheckedChange={(next) => applyTheme(next ? "dark" : "light")}
    />
  );
}
