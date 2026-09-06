import type { ReactNode } from "react";

export function AuthPanel({ children }: { children: ReactNode }) {
  return (
    <div className="enter-rise mt-8 rounded-2xl border border-border bg-surface p-5 [--enter-delay:700ms] sm:p-8">
      {children}
    </div>
  );
}
