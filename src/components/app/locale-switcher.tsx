"use client";

import { Check, ChevronDown } from "lucide-react";
import { useLocale } from "next-intl";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, usePathname } from "@/i18n/navigation";
import { localeNames, locales, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const active = useLocale() as Locale;
  const pathname = usePathname();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`${label}: ${localeNames[active]}`}
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
              asChild
              className={cn(
                "min-h-11 gap-3 text-sm font-semibold",
                isActive
                  ? "bg-surface-soft text-primary-ink focus:bg-surface-soft"
                  : "text-ink hover:bg-surface-sunk hover:text-primary-ink",
              )}
            >
              <Link
                href={pathname}
                locale={locale}
                hrefLang={locale}
                lang={locale}
                aria-current={isActive ? "page" : undefined}
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
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
