import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Surface } from "./surface";

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
      tone="muted"
      padding="lg"
      className={cn("flex flex-col items-center gap-3 text-center", className)}
    >
      {icon ? <div className="text-blue [&_svg]:size-8">{icon}</div> : null}
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      {body ? <p className="max-w-prose text-sm text-ink-muted">{body}</p> : null}
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
  reference?: string;
  className?: string;
}) {
  return (
    <Surface
      tone="alert"
      padding="lg"
      role="alert"
      className={cn("flex flex-col items-center gap-3 text-center", className)}
    >
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      {body ? <p className="max-w-prose text-sm text-ink-muted">{body}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
      {reference ? <p className="text-xs text-ink-muted">{reference}</p> : null}
    </Surface>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-lg bg-surface-strong", className)}
    />
  );
}

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
