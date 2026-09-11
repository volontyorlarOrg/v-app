import { Link } from "@/i18n/navigation";

export type ProfileSummaryRow = {
  key: string;
  label: string;
  value: string;
};

export function ProfileSummary({
  rows,
  change,
}: {
  rows: readonly ProfileSummaryRow[];
  change?: { href: string; label: string };
}) {
  return (
    <dl className="divide-y divide-border">
      {rows.map((row) => (
        <div
          key={row.key}
          className="grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[12rem_minmax(0,1fr)_auto] sm:items-baseline sm:gap-4"
        >
          <dt className="text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase">
            {row.label}
          </dt>
          <dd className="text-sm leading-relaxed whitespace-pre-line text-ink">
            {row.value}
          </dd>
          {change ? (
            <dd className="text-sm sm:text-right">
              <Link
                href={change.href}
                className="font-semibold text-primary-ink underline-offset-4 hover:underline"
              >
                {change.label}
                <span className="sr-only"> — {row.label}</span>
              </Link>
            </dd>
          ) : null}
        </div>
      ))}
    </dl>
  );
}
