"use client";

import { Check, ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocaleSwitch } from "@/hooks/use-locale-switch";
import { localeNames, locales } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const { active, pending, choose } = useLocaleSwitch();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`${label}: ${localeNames[active]}`}
          aria-busy={pending}
          className={cn(
            "group inline-flex h-11 items-center gap-1 rounded-full border border-border bg-surface pr-2 pl-3 text-xs font-semibold tracking-[0.08em] text-ink uppercase transition-colors hover:border-border-control hover:text-primary-ink",
            className,
          )}
        >
          <span>{active}</span>
          <ChevronDown
            aria-hidden="true"
            className="size-3.5 shrink-0 transition-transform group-data-[state=open]:rotate-180"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-48">
        {locales.map((locale) => {
          const isActive = locale === active;
          return (
            <DropdownMenuItem
              key={locale}
              lang={locale}
              aria-current={isActive ? "true" : undefined}
              onSelect={() => choose(locale)}
              className={cn(
                "min-h-11 gap-3 text-sm font-semibold",
                isActive
                  ? "bg-surface-soft text-primary-ink focus:bg-surface-soft"
                  : "text-ink hover:bg-surface-sunk hover:text-primary-ink",
              )}
            >
              <span className="flex-1">{localeNames[locale]}</span>
              {isActive ? (
                <Check aria-hidden="true" className="size-4 text-primary-ink" />
              ) : (
                <span
                  aria-hidden="true"
                  className="text-xs tracking-[0.08em] text-ink-muted uppercase"
                >
                  {locale}
                </span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
