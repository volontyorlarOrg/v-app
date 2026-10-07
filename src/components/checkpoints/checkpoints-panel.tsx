import { useTranslations } from "next-intl";

import { LoadErrorRows, type LoadErrorLabels } from "@/components/app/load-error";
import { Panel } from "@/components/app/panel";
import { CheckpointRow } from "@/components/checkpoints/checkpoint-row";
import { CheckpointSummary } from "@/components/checkpoints/checkpoint-summary";
import type { Loaded } from "@/lib/api/load.server";
import type { CheckpointList } from "@/lib/api/schemas";
import { knownCheckpoints, nextCheckpoints } from "@/lib/checkpoints/checkpoints";
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

  const next = nextCheckpoints(knownCheckpoints(checkpoints.data.items));

  return (
    <Panel
      id="checkpoints"
      title={t("title")}
      description={t("description")}
      action={{ href: navHref("checkpoints"), label: t("all") }}
      padding="none"
      className={className}
    >
      <CheckpointSummary list={checkpoints.data} className="px-5 pt-1 pb-4" />
      {next.length > 0 ? (
        <section aria-label={t("next")} className="border-t border-border">
          <ol>
            {next.map((checkpoint) => (
              <CheckpointRow
                key={checkpoint.key}
                checkpoint={checkpoint}
                claimingEnabled={checkpoints.data.claimingEnabled}
              />
            ))}
          </ol>
        </section>
      ) : (
        <p className="border-t border-border px-5 py-4 text-sm font-semibold text-accent-ink">
          {t("done")}
        </p>
      )}
    </Panel>
  );
}
