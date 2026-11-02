"use client";

import { CircleCheck, Clock3, Info } from "lucide-react";

import { LevelGlyph } from "@/components/levels/level-glyph";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import type { Level, LevelState } from "@/lib/record/levels";
import { cn } from "@/lib/utils";

export type LevelsDialogRow = {
  key: Level;
  name: string;
  startsAt: string;
  state: LevelState;
  toGo: string | null;
};

export type LevelsDialogMeter = {
  value: number;
  max: number;
  label: string;
  valueText: string;
};

export type LevelsDialogLabels = {
  open: string;
  title: string;
  description: string;
  close: string;
  listLabel: string;
  reached: string;
  current: string;
  ahead: string;
  note: string;
};

export function LevelsDialog({
  rows,
  next,
  meter,
  summary,
  labels,
  triggerClassName,
}: {
  rows: readonly LevelsDialogRow[];
  next: string | null;
  meter: LevelsDialogMeter | null;
  summary: string;
  labels: LevelsDialogLabels;
  triggerClassName?: string;
}) {
  return (
    <Dialog>
      <DialogTrigger
        className={cn(
          "inline-flex min-h-(--control-sm) w-fit items-center text-sm font-medium text-primary underline-offset-4 hover:underline",
          triggerClassName,
        )}
      >
        {labels.open}
      </DialogTrigger>
      <DialogContent closeLabel={labels.close} className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="">{labels.title}</DialogTitle>
          <DialogDescription>{labels.description}</DialogDescription>
        </DialogHeader>

        <ol
          aria-label={labels.listLabel}
          className="divide-y divide-border rounded-lg border border-border"
        >
          {rows.map((row) => (
            <li
              key={row.key}
              aria-current={row.state === "current" ? "step" : undefined}
              data-state={row.state}
              className="level-row flex items-center gap-3 px-3 py-2.5 first:rounded-t-lg last:rounded-b-lg"
            >
              <LevelGlyph level={row.key} state={row.state} className="size-8" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{row.name}</p>
                <p className="text-xs text-ink-muted">{row.startsAt}</p>
              </div>
              <LevelStatus row={row} labels={labels} />
            </li>
          ))}
        </ol>

        <div className="grid gap-2">
          {next && meter ? (
            <>
              <p className="text-sm font-medium text-ink">{next}</p>
              <Progress
                value={meter.value}
                max={meter.max}
                valueText={meter.valueText}
                aria-label={meter.label}
              />
              <p className="text-sm text-ink-muted">{summary}</p>
            </>
          ) : (
            <p className="flex items-center gap-2 text-sm font-medium text-ink">
              <CircleCheck aria-hidden="true" className="size-4 shrink-0 text-accent" />
              {summary}
            </p>
          )}
        </div>

        <p className="flex gap-2 text-xs text-ink-muted">
          <Info aria-hidden="true" className="mt-px size-4 shrink-0" />
          {labels.note}
        </p>
      </DialogContent>
    </Dialog>
  );
}

function LevelStatus({
  row,
  labels,
}: {
  row: LevelsDialogRow;
  labels: LevelsDialogLabels;
}) {
  if (row.state === "reached") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 text-xs text-ink-muted">
        <CircleCheck aria-hidden="true" className="size-4 text-accent" />
        {labels.reached}
      </span>
    );
  }
  if (row.state === "current") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-ink">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
        {labels.current}
      </span>
    );
  }
  if (row.state === "next" && row.toGo) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary">
        <Clock3 aria-hidden="true" className="size-3.5" />
        {row.toGo}
      </span>
    );
  }
  return (
    <span className="shrink-0 px-1 text-xs text-ink-muted">
      <span aria-hidden="true">—</span>
      <span className="sr-only">{labels.ahead}</span>
    </span>
  );
}
