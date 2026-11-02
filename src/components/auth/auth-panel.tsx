import type { ReactNode } from "react";

export function AuthPanel({ children }: { children: ReactNode }) {
  return <div className="mt-6">{children}</div>;
}
