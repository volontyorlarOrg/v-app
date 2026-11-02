import { Crown, Sprout, Star, Trophy, UsersRound, type LucideIcon } from "lucide-react";

import type { Level, LevelState } from "@/lib/record/levels";
import { cn } from "@/lib/utils";

export const LEVEL_ICONS: Record<Level, LucideIcon> = {
  newcomer: Sprout,
  volunteer: Star,
  supervisor: Trophy,
  coordinator: UsersRound,
  leader: Crown,
};

export function LevelGlyph({
  level,
  state,
  className,
}: {
  level: Level;
  state: LevelState;
  className?: string;
}) {
  const Icon = LEVEL_ICONS[level];

  return (
    <span
      aria-hidden="true"
      data-state={state}
      className={cn(
        "level-glyph relative inline-grid shrink-0 place-items-center",
        className,
      )}
    >
      <svg viewBox="0 0 48 52" className="level-glyph-shape absolute inset-0 size-full">
        <path d="M24 2.5 44.5 14.25v23.5L24 49.5 3.5 37.75v-23.5Z" />
      </svg>
      <Icon className="level-glyph-icon relative size-[45%]" strokeWidth={2.25} />
    </span>
  );
}

export function LevelChip({
  level,
  name,
  size = "md",
  className,
}: {
  level: Level;
  name: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const Icon = LEVEL_ICONS[level];

  return (
    <span
      data-size={size}
      className={cn(
        "level-chip inline-flex w-fit items-center gap-2 rounded-lg border border-accent/50 font-semibold text-accent-ink",
        size === "md" ? "px-3 py-1.5 text-base" : "px-2.5 py-1 text-sm",
        className,
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn(
          "shrink-0 fill-accent text-accent",
          size === "md" ? "size-5" : "size-4",
        )}
      />
      {name}
    </span>
  );
}
