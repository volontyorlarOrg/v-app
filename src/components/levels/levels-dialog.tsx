"use client";

import { ArrowRight, CircleCheck, Clock3, Info } from "lucide-react";

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
          "group inline-flex min-h-11 w-fit items-center gap-1.5 rounded-md text-base font-semibold text-primary-ink underline-offset-4 hover:underline",
          triggerClassName,
        )}
      >
        {labels.open}
        <ArrowRight
          aria-hidden="true"
          className="size-4 transition-transform group-hover:translate-x-0.5"
        />
      </DialogTrigger>
      <DialogContent closeLabel={labels.close} className="max-w-xl gap-5 p-5 sm:p-7">
        <DialogHeader>
          <DialogTitle className="text-2xl tracking-[-0.015em] sm:text-[1.75rem]">
            {labels.title}
          </DialogTitle>
          <DialogDescription className="text-base">
            {labels.description}
          </DialogDescription>
        </DialogHeader>

        <ol aria-label={labels.listLabel} className="grid gap-2.5">
          {rows.map((row) => (
            <li
              key={row.key}
              aria-current={row.state === "current" ? "step" : undefined}
              data-state={row.state}
              className="level-row flex items-center gap-4 rounded-lg border px-3.5 py-3 sm:px-4"
            >
              <LevelGlyph level={row.key} state={row.state} className="size-12" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{row.name}</p>
                <p className="text-sm text-ink-muted">{row.startsAt}</p>
              </div>
              <LevelStatus row={row} labels={labels} />
            </li>
          ))}
        </ol>

        <div className="grid gap-2 border-t border-border-control/35 pt-5">
          {next && meter ? (
            <>
              <p className="text-lg font-semibold text-ink">{next}</p>
              <Progress
                value={meter.value}
                max={meter.max}
                valueText={meter.valueText}
                aria-label={meter.label}
                className="h-2.5"
              />
              <p className="text-ink-muted">{summary}</p>
            </>
          ) : (
            <p className="flex items-center gap-2 font-semibold text-accent-ink">
              <CircleCheck aria-hidden="true" className="size-5 shrink-0" />
              {summary}
            </p>
          )}
        </div>

        <p className="flex gap-2.5 border-t border-border-control/35 pt-4 text-sm leading-relaxed text-ink-muted">
          <Info aria-hidden="true" className="mt-0.5 size-4.5 shrink-0" />
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
      <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-accent-ink">
        <CircleCheck
          aria-hidden="true"
          className="size-5 fill-accent text-surface-raised"
        />
        {labels.reached}
      </span>
    );
  }
  if (row.state === "current") {
    return (
      <span className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-accent/50 bg-accent/10 px-3 py-1.5 text-sm font-semibold text-accent-ink">
        <span aria-hidden="true" className="size-2 rounded-full bg-accent" />
        {labels.current}
      </span>
    );
  }
  if (row.state === "next" && row.toGo) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary-ink">
        <Clock3 aria-hidden="true" className="size-5" />
        {row.toGo}
      </span>
    );
  }
  return (
    <span className="shrink-0 px-2 text-ink-muted">
      <span aria-hidden="true">—</span>
      <span className="sr-only">{labels.ahead}</span>
    </span>
  );
}
