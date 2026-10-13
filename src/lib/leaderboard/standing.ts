import { LEADERBOARD_PAGE_SIZE } from "@/lib/leaderboard/pagination";

export const VIEWER_ANCHOR = "you";

export type Placed = { rank: number; xp: number };

export type Chase =
  | { kind: "leading" }
  | { kind: "level"; place: number }
  | { kind: "behind"; place: number; xp: number };

export function pageOfRank(
  rank: number,
  pageSize: number = LEADERBOARD_PAGE_SIZE,
): number {
  const size =
    Number.isFinite(pageSize) && pageSize >= 1
      ? Math.floor(pageSize)
      : LEADERBOARD_PAGE_SIZE;
  const place = Number.isFinite(rank) && rank >= 1 ? Math.floor(rank) : 1;
  return Math.ceil(place / size);
}

export function placeAhead(rank: number): number | null {
  return rank > 1 ? rank - 1 : null;
}

export function entryAt<T extends Placed>(
  entries: readonly T[],
  rank: number | null,
): T | null {
  if (rank === null) return null;
  return entries.find((entry) => entry.rank === rank) ?? null;
}

export function chaseOf(viewer: Placed, ahead: Placed | null): Chase | null {
  if (viewer.rank === 1) return { kind: "leading" };
  if (!ahead || ahead.rank !== viewer.rank - 1) return null;
  const gap = ahead.xp - viewer.xp;
  if (gap < 0) return null;
  return gap === 0
    ? { kind: "level", place: ahead.rank }
    : { kind: "behind", place: ahead.rank, xp: gap };
}
