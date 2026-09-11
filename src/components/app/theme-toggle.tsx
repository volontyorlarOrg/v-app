"use client";

import { Moon, Sun } from "lucide-react";
import { useLayoutEffect, useSyncExternalStore } from "react";

import { SwitchControl } from "@/components/ui/switch";
import {
  applyTheme,
  readTheme,
  restorePreferences,
  subscribeToTheme,
  type Theme,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

const SERVER_THEME: Theme = "light";

function useTheme(): Theme {
  return useSyncExternalStore(subscribeToTheme, readTheme, () => SERVER_THEME);
}

export function ThemeToggle({
  label,
  variant = "icon",
  className,
}: {
  label: string;
  variant?: "icon" | "row";
  className?: string;
}) {
  const dark = useTheme() === "dark";

  useLayoutEffect(() => {
    restorePreferences();
  }, []);

  if (variant === "row") {
    return (
      <SwitchControl
        variant="row"
        checked={dark}
        onCheckedChange={(next) => applyTheme(next ? "dark" : "light")}
        aria-label={label}
        className={cn(
          "theme-toggle rounded-lg px-3 text-sm font-semibold text-shell-muted transition-colors hover:bg-shell-raised hover:text-shell-ink",
          className,
        )}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="inline-grid size-5 shrink-0 place-items-center"
          >
            <Sun className="theme-toggle-icon theme-toggle-sun size-5" />
            <Moon className="theme-toggle-icon theme-toggle-moon size-5" />
          </span>
          <span className="truncate">{label}</span>
        </span>
      </SwitchControl>
    );
  }

  return (
    <SwitchControl
      variant="icon"
      checked={dark}
      onCheckedChange={(next) => applyTheme(next ? "dark" : "light")}
      aria-label={label}
      className={cn(
        "theme-toggle inline-grid size-11 shrink-0 place-items-center rounded-full border border-border bg-surface text-ink transition-colors hover:border-primary hover:text-primary-ink",
        className,
      )}
    >
      <Sun aria-hidden="true" className="theme-toggle-icon theme-toggle-sun size-4" />
      <Moon aria-hidden="true" className="theme-toggle-icon theme-toggle-moon size-4" />
    </SwitchControl>
  );
}
