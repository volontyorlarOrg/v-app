import { Check, UserRound } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import {
  ClaimButton,
  type ClaimButtonLabels,
} from "@/components/checkpoints/claim-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Link } from "@/i18n/navigation";
import {
  PROFILE_TASK_ANCHOR,
  rewardPlaces,
  type Checkpoint,
  type ProfileTaskItem,
} from "@/lib/checkpoints/checkpoints";
import { navHref } from "@/lib/routing/routes";
import { cn } from "@/lib/utils";

export function useClaimLabels(xp: number): ClaimButtonLabels {
  const t = useTranslations("checkpoints");
  const format = useFormatter();
  const amount = format.number(xp);
  return {
    claim: t("claim.button", { xp: amount }),
    claiming: t("claim.claiming"),
    claimed: t("claim.claimed"),
    accessible: t("claim.accessible", { name: t("profile.title"), xp: amount }),
    success: t("claim.success", { xp: amount }),
    error: t("claim.error"),
    notReached: t("claim.notReached"),
    unavailable: t("claim.unavailable"),
    exhausted: t("claim.exhausted"),
    photoRequired: t("claim.photoRequired"),
  };
}

export type TaskAvatar = { url: string | null; initials: string };

export function ProfileTask({
  reward,
  checklist,
  avatar,
  claimingEnabled,
  className,
}: {
  reward: Checkpoint;
  checklist: ProfileTaskItem[];
  avatar: TaskAvatar;
  claimingEnabled: boolean;
  className?: string;
}) {
  const t = useTranslations("checkpoints");
  const format = useFormatter();
  const labels = useClaimLabels(reward.xp);
  const done = checklist.filter((item) => item.done).length;
  const total = checklist.length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  const missing = checklist
    .filter((item) => !item.done)
    .map((item) => t(`profile.items.${item.id}`));
  const places = rewardPlaces(reward);
  const titleId = `${PROFILE_TASK_ANCHOR}-title`;
  const progressText = t("profile.progress", {
    done: format.number(done),
    total: format.number(total),
  });
  const placesText = places
    ? t("places.claimed", {
        claimed: format.number(places.claimed),
        limit: format.number(places.limit),
      })
    : null;

  return (
    <Card asChild className={cn("max-w-full min-w-0 scroll-mt-6", className)}>
      <section id={PROFILE_TASK_ANCHOR} aria-labelledby={titleId}>
        <header className="flex items-start gap-4 px-5 py-5 sm:items-center sm:px-6">
          <Avatar aria-hidden="true" className="size-12 sm:size-14">
            {avatar.url ? <AvatarImage src={avatar.url} alt="" /> : null}
            <AvatarFallback className="text-sm">
              {avatar.initials || <UserRound className="size-5" />}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h2 id={titleId} className="text-xl text-balance">
              {t("profile.title")}
            </h2>
            <p className="figure text-sm text-accent-ink">
              {t("xp", { xp: format.number(reward.xp) })}
            </p>
            <p className="mt-1 text-sm text-pretty text-ink-muted">
              {t("profile.body")}
            </p>
          </div>
        </header>

        <div className="grid border-t border-border sm:grid-cols-2 sm:divide-x sm:divide-border">
          <div className="px-5 py-4 sm:px-6">
            <div className="flex items-baseline justify-between gap-4 text-sm text-ink">
              <span>{progressText}</span>
              <span className="tabular">{t("profile.percent", { percent })}</span>
            </div>
            <Progress
              value={done}
              max={total}
              valueText={progressText}
              aria-label={t("profile.label")}
              className="mt-2"
            />
            <p className="mt-2 text-sm text-pretty text-ink-muted">
              {missing.length > 0
                ? t("profile.missing", { fields: format.list(missing) })
                : t("profile.complete")}
            </p>
          </div>
          {places && placesText ? (
            <div className="border-t border-border px-5 py-4 sm:border-t-0 sm:px-6">
              <p className="tabular text-sm text-ink">{placesText}</p>
              <Progress
                value={places.claimed}
                max={places.limit}
                valueText={placesText}
                aria-label={t("places.label")}
                className="mt-2"
              />
              <p className="mt-2 text-sm text-ink-muted">{t("places.note")}</p>
            </div>
          ) : null}
        </div>

        <footer className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <TaskNote reward={reward} limit={places?.limit ?? null} />
          <TaskAction
            state={reward.rewardState}
            complete={missing.length === 0}
            hasPhoto={Boolean(avatar.url)}
            claimingEnabled={claimingEnabled}
            labels={labels}
          />
        </footer>
      </section>
    </Card>
  );
}

function TaskNote({ reward, limit }: { reward: Checkpoint; limit: number | null }) {
  const t = useTranslations("checkpoints");
  const format = useFormatter();

  if (reward.rewardState === "claimed" && reward.claimedAt) {
    return (
      <p className="flex items-center gap-2 text-sm font-medium text-ink">
        <span
          aria-hidden="true"
          className="grid size-4 shrink-0 place-items-center rounded-full bg-accent text-knockout"
        >
          <Check className="size-3" />
        </span>
        {t("status.claimed", {
          xp: format.number(reward.xp),
          date: format.dateTime(new Date(reward.claimedAt), "date"),
        })}
      </p>
    );
  }
  if (reward.rewardState === "exhausted") {
    return (
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">
          {t("status.exhausted", { limit: format.number(limit ?? 1000) })}
        </p>
        <p className="text-sm text-ink-muted">{t("status.exhaustedBody")}</p>
      </div>
    );
  }
  return <p className="text-sm text-ink-muted">{t("footer")}</p>;
}

function TaskAction({
  state,
  complete,
  hasPhoto,
  claimingEnabled,
  labels,
}: {
  state: Checkpoint["rewardState"];
  complete: boolean;
  hasPhoto: boolean;
  claimingEnabled: boolean;
  labels: ClaimButtonLabels;
}) {
  const t = useTranslations("checkpoints");

  if (state === "ready" && hasPhoto)
    return (
      <ClaimButton
        checkpointKey="profile"
        enabled={claimingEnabled}
        labels={labels}
        className="shrink-0"
      />
    );
  if (state === "claimed" || complete) return null;
  return (
    <Link
      href={navHref("profileEdit")}
      className={buttonClass({
        variant: state === "exhausted" ? "outline" : "primary",
        className: "shrink-0",
      })}
    >
      {hasPhoto ? t("completeProfile") : t("addPhoto")}
    </Link>
  );
}
