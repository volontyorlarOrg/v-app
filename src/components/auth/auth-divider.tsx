export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="mt-4 mb-4 flex items-center gap-4" role="presentation">
      <span aria-hidden="true" className="h-px flex-1 bg-border" />
      <span className="text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase">
        {label}
      </span>
      <span aria-hidden="true" className="h-px flex-1 bg-border" />
    </div>
  );
}
