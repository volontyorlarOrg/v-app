import "server-only";

import { cache } from "react";

import { leaderboardSchema, type Leaderboard } from "@/lib/api/schemas";
import { authed } from "@/lib/api/session.server";
import { LEADERBOARD_PAGE_SIZE } from "@/lib/leaderboard/pagination";

export const getLeaderboard = cache(function getLeaderboard(
  page: number,
  pageSize: number = LEADERBOARD_PAGE_SIZE,
): Promise<Leaderboard> {
  return authed("/leaderboard", {
    query: { page, pageSize },
    schema: leaderboardSchema,
  });
});
