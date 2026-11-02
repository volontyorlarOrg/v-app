export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="my-4 flex items-center gap-3" role="presentation">
      <span aria-hidden="true" className="h-px flex-1 bg-border" />
      <span className="text-xs text-ink-muted">{label}</span>
      <span aria-hidden="true" className="h-px flex-1 bg-border" />
    </div>
  );
}
