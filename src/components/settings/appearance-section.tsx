"use client";

import { Check } from "lucide-react";
import { useLocale } from "next-intl";

import { ThemeToggle } from "@/components/app/theme-toggle";
import { Link, usePathname } from "@/i18n/navigation";
import { localeNames, locales, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export type AppearanceLabels = {
  darkTheme: string;
  darkThemeHelp: string;
  language: string;
  languageHelp: string;
};

export function AppearanceSection({ labels }: { labels: AppearanceLabels }) {
  const active = useLocale() as Locale;
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-6">
      <ThemeToggle
        variant="setting"
        label={labels.darkTheme}
        description={labels.darkThemeHelp}
      />

      <div className="border-t border-border pt-6">
        <p className="text-sm font-semibold text-ink">{labels.language}</p>
        <p className="mt-0.5 text-sm text-ink-muted">{labels.languageHelp}</p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-3">
          {locales.map((locale) => {
            const isActive = locale === active;
            return (
              <li key={locale}>
                <Link
                  href={pathname}
                  locale={locale}
                  hrefLang={locale}
                  lang={locale}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center justify-between gap-2 rounded-lg border px-3 text-sm font-semibold transition-colors",
                    isActive
                      ? "border-action bg-action text-knockout"
                      : "border-border text-ink hover:border-primary hover:text-primary-ink",
                  )}
                >
                  <span className="truncate">{localeNames[locale]}</span>
                  {isActive ? (
                    <Check aria-hidden="true" className="size-4 shrink-0" />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-xs tracking-[0.08em] text-ink-muted uppercase"
                    >
                      {locale}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
