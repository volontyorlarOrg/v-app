"use client";

import { Check } from "lucide-react";

import { ThemeToggle } from "@/components/app/theme-toggle";
import { useLocaleSwitch } from "@/hooks/use-locale-switch";
import { localeNames, locales } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export type AppearanceLabels = {
  darkTheme: string;
  darkThemeHelp: string;
  language: string;
  languageHelp: string;
};

export function AppearanceSection({ labels }: { labels: AppearanceLabels }) {
  const { active, pending, choose } = useLocaleSwitch();

  return (
    <div className="flex flex-col gap-4">
      <ThemeToggle
        variant="setting"
        label={labels.darkTheme}
        description={labels.darkThemeHelp}
      />

      <div className="border-t border-border pt-4">
        <p className="text-sm font-medium text-ink">{labels.language}</p>
        <p className="mt-0.5 text-sm text-ink-muted">{labels.languageHelp}</p>
        <ul className="mt-2 grid gap-2 sm:grid-cols-3">
          {locales.map((locale) => {
            const isActive = locale === active;
            return (
              <li key={locale}>
                <button
                  type="button"
                  lang={locale}
                  aria-pressed={isActive}
                  disabled={pending}
                  onClick={() => choose(locale)}
                  className={cn(
                    "flex min-h-(--control-sm) w-full items-center justify-between gap-2 rounded-md border px-3 text-sm font-medium transition-colors disabled:opacity-50",
                    isActive
                      ? "border-transparent bg-surface-soft text-primary"
                      : "border-border text-ink hover:bg-surface-sunk",
                  )}
                >
                  <span className="truncate">{localeNames[locale]}</span>
                  {isActive ? (
                    <Check aria-hidden="true" className="size-4 shrink-0" />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-xs text-ink-muted"
                    >
                      {locale}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
