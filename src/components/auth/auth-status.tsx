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
      className="enter-rise mt-6 flex items-start gap-3 rounded-lg bg-surface-soft px-4 py-3 text-sm leading-relaxed text-primary-ink [--enter-delay:650ms]"
    >
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      {children}
    </p>
  );
}
