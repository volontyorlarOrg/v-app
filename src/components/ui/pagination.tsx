import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Pagination as real links.
 *
 * Anchors, not buttons, so pages are crawlable, openable in a new tab, and
 * usable before the JavaScript bundle arrives — which matters on the slow
 * connections a Telegram in-app browser often has.
 */
export function Pagination({
  page,
  pageSize,
  total,
  hrefFor,
}: {
  page: number;
  pageSize: number;
  total: number;
  /** Builds the URL for a page number. Owned by the caller's route. */
  hrefFor: (page: number) => string;
}) {
  const t = useTranslations("common.action");
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  if (lastPage <= 1) return null;

  const hasPrevious = page > 1;
  const hasNext = page < lastPage;

  return (
    <nav
      aria-label={`${page} / ${lastPage}`}
      className="flex items-center justify-between gap-4"
    >
      <PageLink
        href={hrefFor(page - 1)}
        disabled={!hasPrevious}
        rel="prev"
        label={t("back")}
        icon={<ChevronLeft aria-hidden="true" className="size-4" />}
      />

      <span className="text-sm tabular-nums text-muted">
        {page} / {lastPage}
      </span>

      <PageLink
        href={hrefFor(page + 1)}
        disabled={!hasNext}
        rel="next"
        label={t("continue")}
        icon={<ChevronRight aria-hidden="true" className="size-4" />}
        iconFirst={false}
      />
    </nav>
  );
}

function PageLink({
  href,
  disabled,
  rel,
  label,
  icon,
  iconFirst = true,
}: {
  href: string;
  disabled: boolean;
  rel: "prev" | "next";
  label: string;
  icon: React.ReactNode;
  iconFirst?: boolean;
}) {
  const className = cn(
    "inline-flex h-11 items-center gap-1.5 rounded-lg border px-4 text-sm font-bold",
    disabled
      ? "pointer-events-none border-signal-line/50 text-muted/50"
      : "border-signal-line text-ink transition-colors hover:border-teal hover:bg-field",
  );

  // A disabled control must stay out of the tab order without vanishing, so
  // the boundary of the list is still perceivable.
  if (disabled) {
    return (
      <span aria-disabled="true" className={className}>
        {iconFirst ? icon : null}
        {label}
        {iconFirst ? null : icon}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- href is built from a typed route plus a query string.
    <Link href={href as any} rel={rel} className={className}>
      {iconFirst ? icon : null}
      {label}
      {iconFirst ? null : icon}
    </Link>
  );
}
