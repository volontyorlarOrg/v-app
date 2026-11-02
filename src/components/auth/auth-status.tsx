import { CircleCheck, Info } from "lucide-react";
import type { ReactNode } from "react";

export function AuthStatus({
  tone = "info",
  children,
}: {
  tone?: "info" | "done";
  children: ReactNode;
}) {
  const Icon = tone === "done" ? CircleCheck : Info;

  return (
    <p
      role="status"
      className="mt-4 flex items-start gap-2 rounded-md bg-surface-sunk px-3 py-2 text-sm text-ink"
    >
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      {children}
    </p>
  );
}
