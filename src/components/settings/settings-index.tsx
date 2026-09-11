export type SettingsIndexItem = { id: string; label: string };

export function SettingsIndex({
  label,
  items,
}: {
  label: string;
  items: readonly SettingsIndexItem[];
}) {
  return (
    <nav aria-label={label} className="min-w-0 lg:sticky lg:top-8">
      <ul className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
        {items.map((item) => (
          <li key={item.id} className="shrink-0">
            <a
              href={`#${item.id}`}
              className="inline-flex min-h-10 items-center rounded-full border border-border bg-surface px-4 text-sm font-semibold whitespace-nowrap text-ink-muted transition-colors hover:border-primary hover:text-primary-ink lg:min-h-11 lg:w-full lg:rounded-lg lg:border-transparent lg:bg-transparent lg:px-3 lg:hover:bg-surface-soft"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
