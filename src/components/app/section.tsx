import type { ReactNode } from "react";

import { Scene, SplitWords } from "@/components/motion/scene";
import { cn } from "@/lib/utils";

type Tone = "paper" | "sunk" | "soft" | "ink";

const toneClass: Record<Tone, string> = {
  paper: "bg-transparent text-ink",
  sunk: "bg-surface-sunk text-ink",
  soft: "bg-surface-soft text-ink",
  ink: "bg-band text-knockout",
};

export function Section({
  id,
  tone = "paper",
  className,
  children,
}: {
  id?: string;
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative isolate scroll-mt-20 border-b border-border py-16 sm:py-20 lg:py-24",
        toneClass[tone],
        className,
      )}
    >
      <div className="container-page">{children}</div>
    </section>
  );
}

export function Eyebrow({
  children,
  tone = "primary",
  className,
}: {
  children: ReactNode;
  tone?: "primary" | "inverse";
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-2 text-xs font-semibold tracking-[0.14em] uppercase",
        tone === "primary" ? "text-primary-ink" : "text-band-copy",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "h-px w-6 shrink-0",
          tone === "primary" ? "bg-primary" : "bg-band-copy",
        )}
      />
      {children}
    </p>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  lead,
  tone = "primary",
  className,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  tone?: "primary" | "inverse";
  className?: string;
}) {
  return (
    <Scene variant="group" className={cn("max-w-2xl", className)}>
      {eyebrow ? (
        <Eyebrow tone={tone} className="scene-rise">
          {eyebrow}
        </Eyebrow>
      ) : null}
      <h2
        className={cn(
          "mt-5 text-headline text-balance [--scene-delay:100ms]",
          tone === "inverse" && "text-knockout",
        )}
      >
        <SplitWords text={title} />
      </h2>
      {lead ? (
        <p
          className={cn(
            "scene-rise mt-6 text-lead text-pretty [--scene-delay:340ms]",
            tone === "primary" ? "text-ink-muted" : "text-band-copy",
          )}
        >
          {lead}
        </p>
      ) : null}
    </Scene>
  );
}

export function StatusChip({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-dashed border-border-control px-3 py-1.5 text-xs font-semibold tracking-[0.1em] text-ink-muted uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}
