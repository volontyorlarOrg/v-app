"use client";

import { Check, ChevronDown } from "lucide-react";
import { useLocale } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";

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
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative inline-block", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`${label}: ${localeNames[active]}`}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-11 items-center gap-1 rounded-full border border-border bg-surface pr-2 pl-3 text-xs font-semibold tracking-[0.08em] text-ink uppercase transition-colors hover:border-border-control hover:text-primary-ink"
      >
        <span>{active}</span>
        <ChevronDown
          aria-hidden="true"
          className={cn("size-3.5 shrink-0 transition-transform", open && "rotate-180")}
        />
      </button>

      <nav
        id={panelId}
        aria-label={label}
        hidden={!open}
        className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-[0_18px_40px_-32px_rgb(28_36_43/0.45)]"
      >
        {locales.map((locale) => {
          const isActive = locale === active;
          return (
            <Link
              key={locale}
              href={pathname}
              locale={locale}
              hrefLang={locale}
              lang={locale}
              aria-current={isActive ? "page" : undefined}
              onClick={() => setOpen(false)}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold transition-colors",
                isActive
                  ? "bg-surface-soft text-primary-ink"
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
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
