import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function Panel({
  id,
  title,
  description,
  action,
  padding = "md",
  className,
  children,
}: {
  id?: string;
  title?: string;
  description?: string;
  action?: { href: string; label: string };
  padding?: "md" | "none";
  className?: string;
  children: ReactNode;
}) {
  const titleId = id ? `${id}-title` : undefined;

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "max-w-full min-w-0 rounded-xl border border-border bg-surface",
        className,
      )}
    >
      {title ? (
        <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="font-sans text-base font-semibold text-ink">
              {title}
            </h2>
            {description ? (
              <p className="mt-0.5 text-sm text-ink-muted">{description}</p>
            ) : null}
          </div>
          {action ? (
            <Link
              href={action.href}
              className="inline-flex min-h-8 shrink-0 items-center gap-1 text-sm font-semibold text-primary-ink underline-offset-4 hover:underline"
            >
              {action.label}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          ) : null}
        </header>
      ) : null}
      <div className={cn(padding === "md" && "px-5 py-4")}>{children}</div>
    </section>
  );
}
