"use client";

import { Bell } from "lucide-react";
import { useEffect, useId, useRef, useState, useTransition } from "react";

import { markAllReadAction } from "@/lib/notifications/actions";
import { cn } from "@/lib/utils";

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
};

export function NotificationsMenu({
  label,
  title,
  emptyLabel,
  markAllLabel,
  items,
}: {
  label: string;
  title: string;
  emptyLabel: string;
  markAllLabel: string;
  items: readonly NotificationItem[];
}) {
  const [open, setOpen] = useState(false);
  const [allRead, setAllRead] = useState(false);
  const [pending, startTransition] = useTransition();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const unread = allRead ? 0 : items.filter((item) => item.unread).length;

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

  function markAllRead() {
    startTransition(async () => {
      const result = await markAllReadAction();
      if (result.status === "ok") setAllRead(true);
    });
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={unread > 0 ? `${label} (${unread})` : label}
        onClick={() => setOpen((value) => !value)}
        className="relative inline-grid size-11 place-items-center rounded-full border border-border bg-surface text-ink transition-colors hover:border-border-control hover:text-primary-ink"
      >
        <Bell aria-hidden="true" className="size-4" />
        {unread > 0 ? (
          <span
            aria-hidden="true"
            className="tabular absolute -top-1 -right-1 inline-flex min-w-5 items-center justify-center rounded-full bg-action px-1.5 text-xs leading-5 font-bold text-knockout"
          >
            {unread}
          </span>
        ) : null}
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-lg border border-border bg-surface shadow-[0_18px_40px_-32px_rgb(28_36_43/0.45)]"
      >
        <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-ink">{title}</p>
          {unread > 0 ? (
            <button
              type="button"
              disabled={pending}
              onClick={markAllRead}
              className="text-xs font-semibold text-primary-ink underline-offset-4 hover:underline disabled:opacity-70"
            >
              {markAllLabel}
            </button>
          ) : null}
        </div>
        {items.length === 0 ? (
          <p className="px-4 py-6 text-sm text-ink-muted">{emptyLabel}</p>
        ) : (
          <ul>
            {items.map((item) => (
              <li
                key={item.id}
                className="flex gap-3 border-b border-border px-4 py-3 last:border-b-0"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-1.5 size-2 shrink-0 rounded-full",
                    item.unread && !allRead ? "bg-primary" : "bg-border",
                  )}
                />
                <div className="min-w-0">
                  <p className="text-sm leading-snug font-semibold text-ink">{item.title}</p>
                  {item.body ? (
                    <p className="mt-0.5 text-sm leading-snug text-ink-muted">{item.body}</p>
                  ) : null}
                  <p className="mt-1 text-xs text-ink-muted">{item.time}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
