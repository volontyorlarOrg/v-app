import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

import { Link } from "@/i18n/navigation";
import type { Pagination as PageState } from "@/lib/leaderboard/pagination";
import { cn } from "@/lib/utils";

export type PaginationLabels = {
  label: string;
  previous: string;
  next: string;
  page: string;
  current: string;
};

function fill(template: string, page: number): string {
  return template.replace("{page}", String(page));
}

const STEP_CLASS =
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-lg px-3 text-sm font-semibold transition-colors";

function Step({
  page,
  href,
  label,
  rel,
  children,
}: {
  page: number | null;
  href: (page: number) => string;
  label: string;
  rel: "prev" | "next";
  children: ReactNode;
}) {
  if (page === null) {
    return (
      <span
        aria-disabled="true"
        className={cn(STEP_CLASS, "text-ink-muted opacity-50")}
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href(page)}
      rel={rel}
      aria-label={label}
      className={cn(
        STEP_CLASS,
        "text-primary-ink hover:bg-surface-soft focus-visible:bg-surface-soft",
      )}
    >
      {children}
    </Link>
  );
}

export function Pagination({
  state,
  href,
  labels,
  className,
}: {
  state: PageState;
  href: (page: number) => string;
  labels: PaginationLabels;
  className?: string;
}) {
  if (state.pageCount <= 1) return null;

  return (
    <nav aria-label={labels.label} className={cn("flex justify-center", className)}>
      <ul className="flex flex-wrap items-center justify-center gap-1">
        <li>
          <Step page={state.previous} href={href} label={labels.previous} rel="prev">
            <ChevronLeft aria-hidden="true" className="size-4" />
            <span className="hidden sm:inline">{labels.previous}</span>
          </Step>
        </li>

        {state.pages.map((page) => {
          const active = page === state.page;
          return (
            <li key={page}>
              <Link
                href={href(page)}
                aria-current={active ? "page" : undefined}
                aria-label={fill(active ? labels.current : labels.page, page)}
                className={cn(
                  "tabular inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg px-3 text-sm font-semibold transition-colors",
                  active
                    ? "bg-surface-soft text-primary-ink ring-1 ring-border"
                    : "text-ink-muted hover:bg-surface-sunk hover:text-ink",
                )}
              >
                {page}
              </Link>
            </li>
          );
        })}

        <li>
          <Step page={state.next} href={href} label={labels.next} rel="next">
            <span className="hidden sm:inline">{labels.next}</span>
            <ChevronRight aria-hidden="true" className="size-4" />
          </Step>
        </li>
      </ul>
    </nav>
  );
}
