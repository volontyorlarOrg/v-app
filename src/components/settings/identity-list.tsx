import { Mail, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { StateChip } from "@/components/dashboard/state-chip";
import { GoogleMark, TelegramMark } from "@/components/brand/provider-marks";
import { buttonClass } from "@/components/ui/button";
import type { LinkedIdentities } from "@/lib/account/types";

export function IdentityList({ identities }: { identities: LinkedIdentities }) {
  const t = useTranslations("settings.account");

  const rows: {
    key: string;
    icon: ReactNode;
    name: string;
    detail: string;
    connected: boolean;
    verified?: boolean;
  }[] = [
    {
      key: "telegram",
      icon: <TelegramMark className="size-5" />,
      name: t("telegram"),
      detail: identities.telegram
        ? `@${identities.telegram.username}`
        : t("notConnected"),
      connected: identities.telegram !== null,
    },
    {
      key: "google",
      icon: <GoogleMark className="size-5" />,
      name: t("google"),
      detail: identities.google ? identities.google.email : t("notConnected"),
      connected: identities.google !== null,
    },
    {
      key: "email",
      icon: <Mail aria-hidden="true" className="size-5" />,
      name: t("email"),
      detail: identities.email ? identities.email.address : t("notConnected"),
      connected: identities.email !== null,
      verified: identities.email?.verified,
    },
  ];

  return (
    <ul className="divide-y divide-border">
      {rows.map((row) => (
        <li
          key={row.key}
          className="flex flex-wrap items-center gap-4 py-3 first:pt-0 last:pb-0"
        >
          <span className="inline-grid size-10 shrink-0 place-items-center rounded-full bg-surface-soft text-primary-ink">
            {row.icon}
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
              {row.name}
              {row.verified ? (
                <StateChip tone="structure" icon={<ShieldCheck aria-hidden="true" />}>
                  {t("verified")}
                </StateChip>
              ) : null}
            </p>
            <p className="truncate text-sm text-ink-muted">{row.detail}</p>
          </div>
          <button
            type="button"
            disabled
            className={buttonClass({ variant: "outline", size: "sm" })}
          >
            {row.connected ? t("disconnect") : t("connect")}
          </button>
        </li>
      ))}
    </ul>
  );
}
