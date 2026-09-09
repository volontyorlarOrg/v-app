import { Mail, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { GoogleMark, TelegramMark } from "@/components/brand/provider-marks";
import { StateChip } from "@/components/dashboard/state-chip";
import { buttonClass } from "@/components/ui/button";
import { connectStartHref, type ConnectionState } from "@/lib/account/connections";
import type { ConnectionProvider } from "@/lib/account/types";

const MARKS: Record<ConnectionProvider, ReactNode> = {
  telegram: <TelegramMark className="size-5" />,
  google: <GoogleMark className="size-5" />,
  password: <Mail aria-hidden="true" className="size-5" />,
};

export function ConnectionList({
  states,
  locale,
  googleConfigured,
}: {
  states: readonly ConnectionState[];
  locale: string;
  googleConfigured: boolean;
}) {
  const t = useTranslations("settings.connections");

  return (
    <ul className="divide-y divide-border">
      {states.map((state) => (
        <li
          key={state.provider}
          className="flex flex-wrap items-center gap-4 py-4 first:pt-0 last:pb-0"
        >
          <span className="inline-grid size-10 shrink-0 place-items-center rounded-full bg-surface-soft text-primary-ink">
            {MARKS[state.provider]}
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
              {t(state.provider)}
              {state.verified ? (
                <StateChip tone="structure" icon={<ShieldCheck aria-hidden="true" />}>
                  {t("verified")}
                </StateChip>
              ) : null}
            </p>
            <p className="truncate text-sm text-ink-muted">
              {state.detail ?? t(state.connected ? "connected" : "notConnected")}
            </p>
          </div>
          <ConnectAction
            state={state}
            locale={locale}
            googleConfigured={googleConfigured}
          />
        </li>
      ))}
    </ul>
  );
}

function ConnectAction({
  state,
  locale,
  googleConfigured,
}: {
  state: ConnectionState;
  locale: string;
  googleConfigured: boolean;
}) {
  const t = useTranslations("settings.connections");

  if (state.connected) {
    return (
      <StateChip tone="structure" className="shrink-0">
        {t("connected")}
      </StateChip>
    );
  }

  if (state.provider === "telegram") {
    return (
      <a
        href={connectStartHref("telegram", locale)}
        rel="nofollow"
        className={buttonClass({ variant: "outline", size: "sm" })}
      >
        {t("connectTelegram")}
      </a>
    );
  }

  if (state.provider === "google") {
    return googleConfigured ? (
      <a
        href={connectStartHref("google", locale)}
        rel="nofollow"
        className={buttonClass({ variant: "outline", size: "sm" })}
      >
        {t("connectGoogle")}
      </a>
    ) : (
      <span className="flex flex-col items-end gap-1">
        <button
          type="button"
          disabled
          aria-describedby="google-connect-unavailable"
          className={buttonClass({ variant: "outline", size: "sm" })}
        >
          {t("connectGoogle")}
        </button>
        <span
          id="google-connect-unavailable"
          className="text-xs leading-relaxed text-ink-muted"
        >
          {t("googleUnavailable")}
        </span>
      </span>
    );
  }

  return null;
}
