import { useFormatter, useLocale, useTranslations } from "next-intl";

import type { Locale } from "@/i18n/routing";
import { isPersonalAchievement, type ActivityEntry } from "@/lib/activity/types";
import { localized } from "@/lib/opportunities/types";
import { cn } from "@/lib/utils";

export function ActivityFeed({
  entries,
  now,
}: {
  entries: readonly ActivityEntry[];
  now: Date;
}) {
  const t = useTranslations("dashboard.activity");
  const format = useFormatter();
  const locale = useLocale() as Locale;

  return (
    <ol>
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="grid grid-cols-[0.75rem_1fr] gap-x-3 border-t border-border px-5 py-3 first:border-t-0"
        >
          <span
            aria-hidden="true"
            className={cn(
              "mt-1.5 size-2.5 rounded-full",
              isPersonalAchievement(entry.kind) ? "bg-accent" : "bg-primary",
            )}
          />
          <div>
            <p className="text-sm leading-snug text-ink">
              {t(`kinds.${entry.kind}`, { title: localized(entry.subject, locale) })}
            </p>
            <time dateTime={entry.at} className="mt-1 block text-xs text-ink-muted">
              {format.relativeTime(new Date(entry.at), now)}
            </time>
          </div>
        </li>
      ))}
    </ol>
  );
}
