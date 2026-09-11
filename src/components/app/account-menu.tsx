"use client";

import { Check, ChevronDown, LogOut } from "lucide-react";
import { useLocale } from "next-intl";
import { useState } from "react";

import { routeIcon } from "@/components/app/route-icons";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Link, usePathname } from "@/i18n/navigation";
import { localeNames, locales, type Locale } from "@/i18n/routing";
import { signOut } from "@/lib/auth/actions";
import type { RouteKey } from "@/lib/routing/routes";
import { cn } from "@/lib/utils";

export type AccountMenuItem = {
  key: RouteKey;
  href: string;
  label: string;
  phoneOnly?: boolean;
};

export type AccountMenuLabels = {
  menu: string;
  language: string;
  signOut: string;
};

const ITEM_CLASS =
  "flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-ink transition-colors hover:bg-surface-soft hover:text-primary-ink focus-visible:bg-surface-soft";

export function AccountMenu({
  variant,
  labels,
  name,
  initials,
  handle,
  level,
  items,
  signOutLocale,
  loginHref,
}: {
  variant: "card" | "avatar";
  labels: AccountMenuLabels;
  name: string;
  initials: string;
  handle: string | null;
  level: string;
  items: readonly AccountMenuItem[];
  signOutLocale: string | null;
  loginHref: string;
}) {
  const [open, setOpen] = useState(false);
  const active = useLocale() as Locale;
  const pathname = usePathname();
  const close = () => setOpen(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {variant === "card" ? (
          <button
            type="button"
            aria-label={`${labels.menu}: ${name}`}
            className="group flex w-full items-center gap-3 rounded-xl border border-shell-line bg-shell-raised/60 px-3 py-2.5 text-left transition-colors hover:bg-shell-raised data-[state=open]:bg-shell-raised"
          >
            <Avatar aria-hidden="true" className="size-11 ring-2 ring-accent/70">
              <AvatarFallback className="bg-primary-muted text-sm text-primary-deep">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-shell-ink">
                {name}
              </span>
              <span className="block truncate text-xs text-shell-muted">
                {handle ? `@${handle}` : level}
              </span>
            </span>
            <ChevronDown
              aria-hidden="true"
              className="size-4 shrink-0 text-shell-muted transition-transform group-data-[state=open]:rotate-180"
            />
          </button>
        ) : (
          <button
            type="button"
            aria-label={`${labels.menu}: ${name}`}
            className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-surface transition-colors hover:border-primary data-[state=open]:border-primary"
          >
            <Avatar aria-hidden="true" className="size-9">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
          </button>
        )}
      </PopoverTrigger>

      <PopoverContent
        side={variant === "card" ? "right" : "bottom"}
        align={variant === "card" ? "end" : "end"}
        sideOffset={variant === "card" ? 12 : 8}
        className="w-64 p-1.5"
      >
        <div className="px-3 pt-2 pb-2.5">
          <p className="truncate text-sm font-semibold text-ink">{name}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted">
            {handle ? <span className="truncate">@{handle}</span> : null}
            <Badge variant="achievement">{level}</Badge>
          </p>
        </div>

        <nav aria-label={labels.menu} className="border-t border-border pt-1.5">
          <ul className="flex flex-col">
            {items.map((item) => {
              const Icon = routeIcon(item.key);
              return (
                <li key={item.key} className={cn(item.phoneOnly && "lg:hidden")}>
                  <Link href={item.href} onClick={close} className={ITEM_CLASS}>
                    <Icon aria-hidden="true" className="size-4 text-primary" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-1.5 border-t border-border px-3 pt-3 pb-2">
            <p className="text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase">
              {labels.language}
            </p>
            <ul className="mt-2 grid grid-cols-3 gap-1.5">
              {locales.map((locale) => {
                const isActive = locale === active;
                return (
                  <li key={locale}>
                    <Link
                      href={pathname}
                      locale={locale}
                      hrefLang={locale}
                      lang={locale}
                      aria-label={localeNames[locale]}
                      aria-current={isActive ? "page" : undefined}
                      onClick={close}
                      className={cn(
                        "flex min-h-10 items-center justify-center gap-1 rounded-lg border text-xs font-semibold tracking-[0.08em] uppercase transition-colors",
                        isActive
                          ? "border-action bg-action text-knockout"
                          : "border-border text-ink hover:border-primary hover:text-primary-ink",
                      )}
                    >
                      {isActive ? (
                        <Check aria-hidden="true" className="size-3.5" />
                      ) : null}
                      {locale}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="border-t border-border pt-1.5 lg:hidden">
            {signOutLocale ? (
              <form action={signOut}>
                <input type="hidden" name="locale" value={signOutLocale} />
                <button type="submit" className={ITEM_CLASS}>
                  <LogOut aria-hidden="true" className="size-4" />
                  {labels.signOut}
                </button>
              </form>
            ) : (
              <Link href={loginHref} onClick={close} className={ITEM_CLASS}>
                <LogOut aria-hidden="true" className="size-4" />
                {labels.signOut}
              </Link>
            )}
          </div>
        </nav>
      </PopoverContent>
    </Popover>
  );
}
