import { Mail } from "lucide-react";
import type { ReactNode } from "react";

import { GoogleMark, TelegramMark } from "@/components/brand/provider-marks";
import { StateChip } from "@/components/dashboard/state-chip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  level: string | null;
};

export function AccountSummary({
  id,
  name,
  initials,
  avatarUrl,
  email,
  username,
  connected,
  labels,
  action,
}: {
  id: string;
  name: string;
  initials: string;
  avatarUrl?: string;
  email: string | null;
  username: string;
  connected: readonly { provider: ConnectionProvider; label: string }[];
  labels: AccountSummaryLabels;
  action?: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-20 rounded-lg border border-border bg-surface px-5 py-4 shadow-panel"
    >
      <h2 id={`${id}-title`} className="sr-only">
        {labels.title}
      </h2>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar aria-hidden="true" className="size-12 shrink-0">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
            <AvatarFallback className="text-sm">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{name}</p>
            <p className="flex flex-wrap items-center gap-x-2 text-xs text-ink-muted">
              <span>@{username}</span>
              {email ? (
                <>
                  <span className="truncate">{email}</span>
                </>
              ) : null}
            </p>
            {labels.level ? (
              <p className="mt-1">
                <Badge variant="achievement">{labels.level}</Badge>
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between xl:shrink-0 xl:justify-end xl:gap-6">
          <div className="xl:text-right">
            <p className="text-xs text-ink-muted">{labels.signsInWith}</p>
            <ul className="mt-1 flex flex-wrap gap-1 xl:justify-end">
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
          {action ? (
            <div className="shrink-0 xl:border-l xl:border-border xl:pl-6">
              {action}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
