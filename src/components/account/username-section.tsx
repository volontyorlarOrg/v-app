import { Lock } from "lucide-react";

import { UsernameForm, type UsernameLabels } from "@/components/account/username-form";
import type { UsernameIdentity } from "@/lib/account/username";

export type { UsernameLabels };

export function UsernameSection({
  locale,
  identity,
  labels,
  headed = true,
  onSaved,
}: {
  locale: string;
  identity: UsernameIdentity;
  labels: UsernameLabels;
  headed?: boolean;
  onSaved?: () => void;
}) {
  return (
    <div>
      {headed ? (
        <>
          <h3 className="font-sans text-sm font-semibold text-ink">{labels.legend}</h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">
            {labels.description}
          </p>
        </>
      ) : null}

      <div className={headed ? "mt-4" : undefined}>
        <p className="text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase">
          {labels.current}
        </p>
        <p className="tabular mt-1 text-lg font-semibold break-words text-ink">
          @{identity.username}
        </p>
      </div>

      {identity.editable ? (
        <>
          {identity.source === "generated" ? (
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {labels.generated}
            </p>
          ) : null}
          <div className="mt-4 border-t border-border pt-4">
            <UsernameForm
              locale={locale}
              identity={identity}
              labels={labels}
              onSaved={onSaved}
            />
          </div>
        </>
      ) : (
        <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-ink-muted">
          <Lock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{labels.managed}</span>
        </p>
      )}
    </div>
  );
}
