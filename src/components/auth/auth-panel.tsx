import type { ReactNode } from "react";

export function AuthPanel({ children }: { children: ReactNode }) {
  return (
    <div className="enter-rise mt-8 rounded-2xl border border-border bg-surface p-5 [--enter-delay:700ms] sm:p-8">
      {children}
    </div>
  );
}

export function AuthDivider({ label }: { label: string }) {
  return (
    <p className="my-6 flex items-center gap-4 text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase">
      <span aria-hidden="true" className="h-px flex-1 bg-border" />
      {label}
      <span aria-hidden="true" className="h-px flex-1 bg-border" />
    </p>
  );
}
