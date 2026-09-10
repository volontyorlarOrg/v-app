import { useFormatter, useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { PageHeader } from "@/components/app/page-header";
import { Pagination } from "@/components/app/pagination";
import { Panel } from "@/components/app/panel";
import { StatTiles, type Stat } from "@/components/app/stat-tile";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getLeaderboard } from "@/lib/api/leaderboard.server";
import type { Leaderboard as LeaderboardPage } from "@/lib/api/schemas";
import { paginate, type Pagination as PageState } from "@/lib/leaderboard/pagination";
import {
  leaderboardPageHref,
  leaderboardPageParser,
} from "@/lib/leaderboard/search-params";
import { localePath, navHref } from "@/lib/routing/routes";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/leaderboard">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "leaderboard" });
  return { title: t("metaTitle") };
}

export default async function LeaderboardRoute({
  params,
  searchParams,
}: PageProps<"/[locale]/leaderboard">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const query = await searchParams;
  const requested = Math.max(1, leaderboardPageParser.parseServerSide(query.page));
  const board = await getLeaderboard(requested);
  const state = paginate({
    page: board.page,
    pageSize: board.pageSize,
    total: board.total,
  });

  if (board.items.length === 0 && board.total > 0 && requested !== state.pageCount) {
    redirect(
      leaderboardPageHref(localePath(locale as Locale, "leaderboard"), state.pageCount),
    );
  }

  return <Leaderboard board={board} state={state} />;
}

function Leaderboard({ board, state }: { board: LeaderboardPage; state: PageState }) {
  const t = useTranslations("leaderboard");
  const format = useFormatter();

  const viewer = board.viewer;
  const stats: Stat[] = viewer
    ? [
        {
          id: "rank",
          label: t("standing.rank"),
          value: format.number(viewer.rank),
          note: t("standing.of", { total: board.total }),
          achievement: true,
        },
        {
          id: "xp",
          label: t("standing.xp"),
          value: format.number(viewer.xp),
          note: t("standing.xpHelp"),
          achievement: true,
        },
      ]
    : [];

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />

      {viewer ? (
        <>
          <StatTiles stats={stats} className="mt-6 xl:grid-cols-2" />
          <p className="enter-rise mt-3 text-sm text-ink-muted [--enter-delay:260ms]">
            {t("standing.appearAs")}{" "}
            <span className="font-semibold text-ink">@{viewer.username}</span>
            <span aria-hidden="true"> · </span>
            <Link
              href={navHref("settings")}
              className="font-semibold text-primary-ink underline-offset-4 hover:underline"
            >
              {t("standing.changeHandle")}
            </Link>
          </p>
        </>
      ) : (
        <Panel className="mt-6">
          <p className="font-semibold text-ink">{t("standing.unrankedTitle")}</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">
            {t("standing.unrankedBody")}
          </p>
        </Panel>
      )}

      <Panel
        id="standings"
        title={t("table.title")}
        description={t("table.description")}
        padding="none"
        className="mt-6"
      >
        {board.items.length === 0 ? (
          <p className="px-5 py-6 text-sm text-ink-muted">{t("table.empty")}</p>
        ) : (
          <LeaderboardTable
            entries={board.items}
            viewerUsername={viewer?.username ?? null}
          />
        )}

        {board.total > 0 ? (
          <div className="border-t border-border px-5 py-4">
            <p role="status" className="text-center text-sm text-ink-muted">
              {t("table.showing", {
                first: state.range.first,
                last: state.range.last,
                total: state.total,
              })}
            </p>
            <Pagination
              state={state}
              href={(page) => leaderboardPageHref(navHref("leaderboard"), page)}
              labels={{
                label: t("pagination.label"),
                previous: t("pagination.previous"),
                next: t("pagination.next"),
                page: t("pagination.page", { page: "{page}" }),
                current: t("pagination.current", { page: "{page}" }),
              }}
              className="mt-3"
            />
          </div>
        ) : null}
      </Panel>
    </>
  );
}
