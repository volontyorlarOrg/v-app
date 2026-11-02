import { CircleCheck, Send, TrendingUp, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Panel } from "@/components/app/panel";
import { buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { navHref } from "@/lib/routing/routes";

const STEPS: ReadonlyArray<{ key: "apply" | "accepted" | "record"; Icon: LucideIcon }> =
  [
    { key: "apply", Icon: Send },
    { key: "accepted", Icon: CircleCheck },
    { key: "record", Icon: TrendingUp },
  ];

export function GettingStarted({ id, className }: { id?: string; className?: string }) {
  const t = useTranslations("dashboard.start");

  return (
    <Panel
      id={id}
      title={t("title")}
      description={t("description")}
      className={className}
    >
      <ol className="grid gap-4 md:grid-cols-3">
        {STEPS.map(({ key, Icon }) => (
          <li key={key} className="flex gap-2.5">
            <span aria-hidden="true" className="mt-0.5 shrink-0 text-ink-muted">
              <Icon className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink">{t(`steps.${key}.title`)}</p>
              <p className="text-sm text-ink-muted">{t(`steps.${key}.body`)}</p>
            </div>
          </li>
        ))}
      </ol>
      <Link
        href={navHref("opportunities")}
        className={buttonClass({ className: "mt-4" })}
      >
        {t("cta")}
      </Link>
    </Panel>
  );
}
