import {
  AtSign,
  Bookmark,
  CalendarCheck,
  CircleCheck,
  Clock,
  FileText,
  KeyRound,
  Medal,
  Send,
  Trophy,
  UserRoundCheck,
  type LucideIcon,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { ClaimButton } from "@/components/checkpoints/claim-button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  hasCountedProgress,
  isReached,
  isClaimed,
  type Checkpoint,
  type CheckpointKey,
} from "@/lib/checkpoints/checkpoints";
import { cn } from "@/lib/utils";

const ICONS: Record<CheckpointKey, LucideIcon> = {
  username: AtSign,
  profile: UserRoundCheck,
  telegram: Send,
  second_sign_in: KeyRound,
  first_saved: Bookmark,
  first_application: FileText,
  first_acceptance: CircleCheck,
  events_1: CalendarCheck,
  events_3: CalendarCheck,
  events_8: CalendarCheck,
  events_20: CalendarCheck,
  hours_10: Clock,
  hours_25: Clock,
  hours_50: Clock,
  hours_100: Clock,
  competition_1: Trophy,
  competition_win: Medal,
};

export function CheckpointRow({
  checkpoint,
  claimingEnabled,
}: {
  checkpoint: Checkpoint;
  claimingEnabled: boolean;
}) {
  const t = useTranslations("checkpoints");
  const format = useFormatter();
  const Icon = ICONS[checkpoint.key];
  const reached = isReached(checkpoint);
  const claimed = isClaimed(checkpoint);
  const title = t(`items.${checkpoint.key}.title`);
  const progress = t("progress", {
    progress: format.number(checkpoint.progress),
    target: format.number(checkpoint.target),
  });

  return (
    <li className="flex gap-4 border-t border-border px-5 py-4 first:border-t-0">
      <span
        aria-hidden="true"
        className={cn(
          "inline-grid size-10 shrink-0 place-items-center rounded-full",
          reached
            ? "bg-accent text-knockout"
            : "border border-border-control text-ink-muted",
        )}
      >
        <Icon className="size-4.5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
          <h3
            className={cn(
              "min-w-0 text-base font-semibold text-balance",
              reached ? "text-accent-ink" : "text-ink",
            )}
          >
            {title}
            <span className="sr-only">
              {" "}
              (
              {claimed
                ? t("claim.claimed")
                : reached
                  ? t("claim.ready")
                  : t("notReached")}
              )
            </span>
          </h3>
          <Badge
            variant={reached ? "achievement" : "neutral"}
            className="tabular shrink-0"
          >
            {t("xp", { xp: format.number(checkpoint.xp) })}
          </Badge>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-ink-muted">
          {t(`items.${checkpoint.key}.body`)}
        </p>
        {reached && checkpoint.completedAt ? (
          <p className="mt-1 text-sm text-ink-muted">
            {t("reachedOn", {
              date: format.dateTime(new Date(checkpoint.completedAt), "date"),
            })}
          </p>
        ) : hasCountedProgress(checkpoint) ? (
          <div className="mt-3 flex items-center gap-3">
            <Progress
              value={checkpoint.progress}
              max={checkpoint.target}
              valueText={progress}
              aria-label={title}
              className="flex-1"
            />
            <span className="tabular shrink-0 text-sm text-ink-muted">{progress}</span>
          </div>
        ) : null}
        {claimed && checkpoint.claimedAt ? (
          <p className="mt-2 text-sm font-semibold text-accent-ink">
            {t("claim.claimedOn", {
              date: format.dateTime(new Date(checkpoint.claimedAt), "date"),
            })}
          </p>
        ) : reached ? (
          <>
            <p className="mt-2 text-sm font-semibold text-accent-ink">
              {t("claim.ready")}
            </p>
            <ClaimButton
              checkpointKey={checkpoint.key}
              enabled={claimingEnabled}
              labels={{
                claim: t("claim.button", { xp: format.number(checkpoint.xp) }),
                claiming: t("claim.claiming"),
                claimed: t("claim.claimed"),
                accessible: t("claim.accessible", {
                  name: title,
                  xp: format.number(checkpoint.xp),
                }),
                success: t("claim.success", { xp: format.number(checkpoint.xp) }),
                error: t("claim.error"),
                notReached: t("claim.notReached"),
                unavailable: t("claim.unavailable"),
              }}
            />
          </>
        ) : (
          <p className="mt-2 text-sm text-ink-muted">{t("notReached")}</p>
        )}
      </div>
    </li>
  );
}
