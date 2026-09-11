import { Mail } from "lucide-react";
import type { ReactNode } from "react";

import { GoogleMark, TelegramMark } from "@/components/brand/provider-marks";
import { StateChip } from "@/components/dashboard/state-chip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { ConnectionProvider } from "@/lib/account/types";

const MARKS: Record<ConnectionProvider, ReactNode> = {
  telegram: <TelegramMark className="size-3.5" />,
  google: <GoogleMark className="size-3.5" />,
  password: <Mail aria-hidden="true" className="size-3.5" />,
};

export type AccountSummaryLabels = {
  title: string;
  signsInWith: string;
  nothingConnected: string;
  level: string;
};

export function AccountSummary({
  id,
  name,
  initials,
  email,
  username,
  connected,
  labels,
}: {
  id: string;
  name: string;
  initials: string;
  email: string | null;
  username: string;
  connected: readonly { provider: ConnectionProvider; label: string }[];
  labels: AccountSummaryLabels;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="standing-card enter-rise scroll-mt-20 rounded-xl border border-border px-5 py-5 sm:px-6"
    >
      <h2 id={`${id}-title`} className="sr-only">
        {labels.title}
      </h2>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar aria-hidden="true" className="size-14 shrink-0 ring-2 ring-accent/70">
            <AvatarFallback className="text-base">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-ink">{name}</p>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-ink-muted">
              <span className="font-semibold text-ink">@{username}</span>
              {email ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="truncate">{email}</span>
                </>
              ) : null}
            </p>
            <p className="mt-1">
              <Badge variant="achievement">{labels.level}</Badge>
            </p>
          </div>
        </div>

        <div className="sm:text-right">
          <p className="text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase">
            {labels.signsInWith}
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5 sm:justify-end">
            {connected.length === 0 ? (
              <li className="text-sm text-ink-muted">{labels.nothingConnected}</li>
            ) : (
              connected.map((item) => (
                <li key={item.provider}>
                  <StateChip tone="structure" icon={MARKS[item.provider]}>
                    {item.label}
                  </StateChip>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
