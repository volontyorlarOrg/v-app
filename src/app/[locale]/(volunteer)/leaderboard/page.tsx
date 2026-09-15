import { TrendingUp } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { EmptyState } from "@/components/app/empty-state";
import {
  LoadErrorPanel,
  loadErrorLabels,
  type LoadErrorLabels,
} from "@/components/app/load-error";
import { PageHeader } from "@/components/app/page-header";
import { Pagination } from "@/components/app/pagination";
import { Panel } from "@/components/app/panel";
import {
  LeaderboardPodium,
  PODIUM_SIZE,
} from "@/components/leaderboard/leaderboard-podium";
import { LeaderboardStanding } from "@/components/leaderboard/leaderboard-standing";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import type { Locale } from "@/i18n/routing";
import { getMe } from "@/lib/api/account.server";
import { usernameIdentity } from "@/lib/account/username";
import { getLeaderboard } from "@/lib/api/leaderboard.server";
import { settle, type LoadFailure } from "@/lib/api/load.server";
import type { Leaderboard as LeaderboardPage } from "@/lib/api/schemas";
import { requireSession } from "@/lib/api/session.server";
import { paginate, type Pagination as PageState } from "@/lib/leaderboard/pagination";
import {
  leaderboardPageHref,
  leaderboardPageParser,
} from "@/lib/leaderboard/search-params";
import { initialsOf } from "@/lib/profile/initials";
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
  const [, me, loaded, common] = await Promise.all([
    requireSession(),
    getMe(),
    settle(() => getLeaderboard(requested)),
    getTranslations({ locale, namespace: "common" }),
  ]);

  if (loaded.status === "failed") {
    return (
      <LeaderboardUnavailable
        failure={loaded.failure}
        labels={loadErrorLabels(common)}
      />
    );
  }

  const board = loaded.data;
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

  return (
    <Leaderboard
      board={board}
      state={state}
      handleEditable={usernameIdentity(me).editable}
    />
  );
}

function LeaderboardUnavailable({
  failure,
  labels,
}: {
  failure: LoadFailure;
  labels: LoadErrorLabels;
}) {
  const t = useTranslations("leaderboard");

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <LoadErrorPanel failure={failure} labels={labels} />
    </>
  );
}

function Leaderboard({
  board,
  state,
  handleEditable,
}: {
  board: LeaderboardPage;
  state: PageState;
  handleEditable: boolean;
}) {
  const t = useTranslations("leaderboard");
  const format = useFormatter();

  const viewer = board.viewer;
  const podium =
    board.page === 1 ? board.items.filter((entry) => entry.rank <= PODIUM_SIZE) : [];
  const rest =
    podium.length > 0
      ? board.items.filter((entry) => entry.rank > PODIUM_SIZE)
      : board.items;

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <p className="inline-flex min-h-11 items-center gap-2 text-sm text-ink-muted">
            <TrendingUp aria-hidden="true" className="size-4 text-accent" />
            <span className="tabular font-semibold text-accent-ink">
              {format.number(board.total)}
            </span>
            {t("count", { count: board.total })}
          </p>
        }
      />

      <div className="mt-6 flex flex-col gap-6">
        <LeaderboardStanding
          name={viewer.displayName}
          initials={initialsOf(viewer.displayName)}
          username={viewer.username}
          rank={viewer.rank}
          xp={viewer.xp}
          total={board.total}
          scoring={{
            event: board.scoring.attendedEventXp,
            hour: board.scoring.confirmedHourXp,
          }}
          handleEditable={handleEditable}
        />

        {podium.length > 0 ? <LeaderboardPodium entries={podium} /> : null}

        <Panel
          id="standings"
          title={t("table.title")}
          description={t("table.description")}
          padding="none"
        >
          {board.items.length === 0 ? (
            <EmptyState body={t("table.empty")} />
          ) : rest.length > 0 ? (
            <LeaderboardTable entries={rest} />
          ) : null}

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
      </div>
    </>
  );
}
