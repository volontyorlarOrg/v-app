import { createSerializer, parseAsInteger } from "nuqs/server";

export const leaderboardPageParser = parseAsInteger.withDefault(1);

export const serializeLeaderboardSearch = createSerializer({
  page: leaderboardPageParser,
});

export function leaderboardPageHref(path: string, page: number): string {
  return serializeLeaderboardSearch(path, { page: page > 1 ? page : null });
}
