import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pageSize,
  total,
  hrefFor,
}: {
  page: number;
  pageSize: number;
  total: number;
  hrefFor: (page: number) => string;
}) {
  const t = useTranslations("common.action");
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  if (lastPage <= 1) return null;

  return (
    <nav
      aria-label={`${page} / ${lastPage}`}
      className="flex items-center justify-between gap-4"
    >
      <PageLink
        href={hrefFor(page - 1)}
        disabled={page <= 1}
        rel="prev"
        label={t("back")}
        icon={<ChevronLeft aria-hidden="true" className="size-4" />}
      />

      <span className="text-sm text-ink-muted tabular-nums">
        {page} / {lastPage}
      </span>

      <PageLink
        href={hrefFor(page + 1)}
        disabled={page >= lastPage}
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
  icon: ReactNode;
  iconFirst?: boolean;
}) {
  const className = cn(
    "inline-flex h-11 items-center gap-1.5 rounded-lg border px-4 text-sm font-semibold",
    disabled
      ? "pointer-events-none border-line text-ink-muted/50"
      : "border-line-control text-blue-deep transition-colors hover:bg-blue-tint",
  );

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
    <Link href={href} rel={rel} className={className}>
      {iconFirst ? icon : null}
      {label}
      {iconFirst ? null : icon}
    </Link>
  );
}
