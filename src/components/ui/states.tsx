import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Surface } from "./surface";

/**
 * Empty, error, and loading states.
 *
 * One implementation each, because the handoff's rule — "do not collapse every
 * failure into 'Something went wrong'" — only holds if there is a component
 * that *requires* a specific title and body at every call site.
 *
 * These are server-safe: they take rendered strings, so a Server Component
 * that already has `t` can use them without a client boundary.
 */

export function EmptyState({
  title,
  body,
  icon,
  action,
  className,
}: {
  title: string;
  body?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <Surface
      tone="quiet"
      padding="lg"
      className={cn("flex flex-col items-center gap-3 text-center", className)}
    >
      {icon ? <div className="text-muted [&_svg]:size-8">{icon}</div> : null}
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      {body ? <p className="max-w-prose text-sm text-muted">{body}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </Surface>
  );
}

export function ErrorState({
  title,
  body,
  action,
  reference,
  className,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
  /** Correlation id. Shown small so support can ask for it; never the message. */
  reference?: string;
  className?: string;
}) {
  return (
    <Surface
      tone="quiet"
      padding="lg"
      // `role="alert"` because an error replacing content is a change the user
      // needs told about, not one they will notice by looking.
      role="alert"
      className={cn(
        "flex flex-col items-center gap-3 border-danger/40 text-center",
        className,
      )}
    >
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      {body ? <p className="max-w-prose text-sm text-muted">{body}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
      {reference ? (
        <p className="text-xs text-muted/70">{reference}</p>
      ) : null}
    </Surface>
  );
}

/**
 * Skeleton block.
 *
 * `aria-hidden` because a screen reader gains nothing from a shimmering box;
 * the loading state is announced once by the region that contains it.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-lg bg-panel-strong/60", className)}
    />
  );
}

/**
 * Announces a loading region to assistive technology while showing skeletons
 * to everyone else.
 */
export function LoadingRegion({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
