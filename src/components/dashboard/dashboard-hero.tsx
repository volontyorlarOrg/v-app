import { useFormatter, useTranslations } from "next-intl";

import { LoadErrorRows, type LoadErrorLabels } from "@/components/app/load-error";
import { VolunteerPass, type PassHolder } from "@/components/dashboard/volunteer-pass";
import { LevelChip } from "@/components/levels/level-glyph";
import { LevelsDialog, type LevelsDialogRow } from "@/components/levels/levels-dialog";
import { Progress } from "@/components/ui/progress";
import type { Loaded } from "@/lib/api/load.server";
import type { Progress as VolunteerProgress } from "@/lib/api/schemas";
import { levelRows, nextLevelMeter, type Level } from "@/lib/record/levels";

export function DashboardHero({
  greeting,
  progress,
  holder,
  errorLabels,
}: {
  greeting: string;
  progress: Loaded<VolunteerProgress>;
  holder: Omit<PassHolder, "role" | "level">;
  errorLabels: LoadErrorLabels;
}) {
  const t = useTranslations("dashboard");
  const record = useTranslations("record");
  const loaded = progress.status === "loaded" ? progress.data : null;
  const levelName = (level: Level) => record(`level.${level}`);

  return (
    <section aria-labelledby="dashboard-greeting" className="dashboard-hero">
      <h1
        id="dashboard-greeting"
        className="dashboard-hero-greeting text-3xl sm:text-4xl"
      >
        {greeting}
      </h1>

      {loaded ? (
        <HeroLevel progress={loaded} levelName={levelName} />
      ) : progress.status === "failed" ? (
        <div className="dashboard-hero-next">
          <LoadErrorRows
            failure={progress.failure}
            labels={errorLabels}
            className="px-0 py-2"
          />
        </div>
      ) : null}
      <div aria-hidden="true" className="dashboard-pass">
        <VolunteerPass
          holder={{
            ...holder,
            role: t("pass.role"),
            level: loaded ? { key: loaded.level, name: levelName(loaded.level) } : null,
          }}
        />
      </div>
    </section>
  );
}

function HeroLevel({
  progress,
  levelName,
}: {
  progress: VolunteerProgress;
  levelName: (level: Level) => string;
}) {
  const t = useTranslations("dashboard.hero");
  const levels = useTranslations("levels");
  const format = useFormatter();

  const hours = (value: number) => format.number(value, { maximumFractionDigits: 2 });
  const meter = nextLevelMeter(progress);
  const next = progress.nextLevel;
  const nextTitle = next ? t("next", { level: levelName(next.key) }) : null;
  const summary = next ? t("toGo", { hours: next.hoursToGo }) : t("top");
  const meterLabel = next ? t("meterLabel", { level: levelName(next.key) }) : "";

  const rows: LevelsDialogRow[] = levelRows(progress).map((row) => ({
    key: row.key,
    name: levelName(row.key),
    startsAt: levels("startsAt", { hours: hours(row.minHours) }),
    state: row.state,
    toGo:
      row.hoursToGo === null ? null : levels("toGo", { hours: hours(row.hoursToGo) }),
  }));

  return (
    <>
      <LevelChip
        level={progress.level}
        name={levelName(progress.level)}
        className="dashboard-hero-level"
      />

      <div className="dashboard-hero-next">
        {nextTitle && meter ? (
          <>
            <p className="text-sm font-medium text-ink">{nextTitle}</p>
            <Progress
              value={meter.value}
              max={meter.max}
              valueText={summary}
              aria-label={meterLabel}
              className="mt-2"
            />
            <p className="mt-2 text-sm text-ink-muted">{summary}</p>
          </>
        ) : (
          <p className="text-sm font-medium text-ink">{summary}</p>
        )}
      </div>

      <div className="dashboard-hero-action">
        <LevelsDialog
          rows={rows}
          next={next ? levels("next", { level: levelName(next.key) }) : null}
          meter={
            meter
              ? {
                  ...meter,
                  label: meterLabel,
                  valueText: levels("nextToGo", { hours: next?.hoursToGo ?? 0 }),
                }
              : null
          }
          summary={next ? levels("nextToGo", { hours: next.hoursToGo }) : levels("top")}
          labels={{
            open: levels("open"),
            title: levels("title"),
            description: levels("description"),
            close: levels("close"),
            listLabel: levels("listLabel"),
            reached: levels("reached"),
            current: levels("current"),
            ahead: levels("ahead"),
            note: levels("note"),
          }}
        />
      </div>
    </>
  );
}
