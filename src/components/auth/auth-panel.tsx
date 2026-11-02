import type { ReactNode } from "react";

export function AuthPanel({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 rounded-xl border border-border bg-surface p-5 shadow-panel">
      {children}
    </div>
  );
}
