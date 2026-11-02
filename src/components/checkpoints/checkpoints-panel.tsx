import { ArrowRight, UserRound } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { LoadErrorRows, type LoadErrorLabels } from "@/components/app/load-error";
import { Panel } from "@/components/app/panel";
import { ClaimButton } from "@/components/checkpoints/claim-button";
import { useClaimLabels } from "@/components/checkpoints/profile-task";
import { buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Loaded } from "@/lib/api/load.server";
import type { CheckpointList } from "@/lib/api/schemas";
import {
  PROFILE_TASK_ANCHOR,
  profileReward,
  rewardPlaces,
  type Checkpoint,
} from "@/lib/checkpoints/checkpoints";
import { navHref } from "@/lib/routing/routes";

export function CheckpointsPanel({
  checkpoints,
  errorLabels,
  className,
}: {
  checkpoints: Loaded<CheckpointList>;
  errorLabels: LoadErrorLabels;
  className?: string;
}) {
  const t = useTranslations("checkpoints.panel");

  if (checkpoints.status === "failed") {
    return (
      <Panel
        id="checkpoints"
        title={t("title")}
        description={t("description")}
        padding="none"
        className={className}
      >
        <LoadErrorRows failure={checkpoints.failure} labels={errorLabels} />
      </Panel>
    );
  }

  const reward = profileReward(checkpoints.data.items);
  if (!reward || reward.rewardState === "claimed" || reward.rewardState === "exhausted")
    return null;

  return (
    <Panel
      id="checkpoints"
      title={t("title")}
      description={t("description")}
      action={{
        href: `${navHref("checkpoints")}#${PROFILE_TASK_ANCHOR}`,
        label: t("all"),
      }}
      padding="none"
      className={className}
    >
      <ProfileTaskRow
        reward={reward}
        claimingEnabled={checkpoints.data.claimingEnabled}
      />
    </Panel>
  );
}

function ProfileTaskRow({
  reward,
  claimingEnabled,
}: {
  reward: Checkpoint;
  claimingEnabled: boolean;
}) {
  const t = useTranslations("checkpoints");
  const format = useFormatter();
  const labels = useClaimLabels(reward.xp);
  const places = rewardPlaces(reward);
  const ready = reward.rewardState === "ready";

  return (
    <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center">
      <span
        aria-hidden="true"
        className="relative hidden size-11 shrink-0 place-items-center rounded-full bg-surface-sunk text-ink sm:grid"
      >
        <UserRound className="size-5" />
        <span className="absolute top-2 right-1.5 size-2 rounded-full bg-accent" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-semibold text-ink">{t("profile.title")}</span>
          <span className="display-face tabular text-xl leading-none text-accent-ink">
            {t("xp", { xp: format.number(reward.xp) })}
          </span>
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          {ready
            ? claimingEnabled
              ? t("status.ready")
              : t("status.paused")
            : t("profile.body")}
          {places ? (
            <>
              {" "}
              <span className="tabular">
                {t("places.claimed", {
                  claimed: format.number(places.claimed),
                  limit: format.number(places.limit),
                })}
              </span>
            </>
          ) : null}
        </p>
      </div>
      {ready ? (
        <ClaimButton
          checkpointKey="profile"
          enabled={claimingEnabled}
          labels={labels}
          size="sm"
        />
      ) : (
        <Link href={navHref("profileEdit")} className={buttonClass({ size: "sm" })}>
          {t("completeProfile")}
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      )}
    </div>
  );
}
