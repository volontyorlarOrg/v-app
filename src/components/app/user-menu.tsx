"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { Avatar } from "@/components/app/avatar";
import { Link } from "@/i18n/navigation";

export type UserMenuItem = { href: string; label: string };

export function UserMenu({
  label,
  name,
  initials,
  items,
  signOut,
}: {
  label: string;
  name: string;
  initials: string;
  items: readonly UserMenuItem[];
  signOut: ReactNode;
}) {
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
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`${label}: ${name}`}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex size-11 items-center justify-center rounded-full border border-border transition-colors hover:border-border-control"
      >
        <Avatar initials={initials} className="size-9 text-xs" />
      </button>

      <nav
        id={panelId}
        aria-label={label}
        hidden={!open}
        className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-[0_18px_40px_-32px_rgb(28_36_43/0.45)]"
      >
        <p className="truncate px-3 py-2 text-sm font-semibold text-ink">{name}</p>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className="flex min-h-11 items-center rounded-md px-3 text-sm font-semibold text-ink transition-colors hover:bg-surface-sunk hover:text-primary-ink"
          >
            {item.label}
          </Link>
        ))}
        {signOut}
      </nav>
    </div>
  );
}
