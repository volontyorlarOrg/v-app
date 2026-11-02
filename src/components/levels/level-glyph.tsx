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
      <Icon className="level-glyph-icon relative size-[45%]" />
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
        "inline-flex w-fit items-center gap-1.5 rounded-md bg-accent/10 font-medium text-accent-ink",
        size === "md" ? "px-2.5 py-1 text-sm" : "px-2 py-0.5 text-xs",
        className,
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn(
          "shrink-0 fill-accent text-accent",
          size === "md" ? "size-4" : "size-3.5",
        )}
      />
      {name}
    </span>
  );
}
