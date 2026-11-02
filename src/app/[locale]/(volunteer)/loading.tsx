import { useTranslations } from "next-intl";

import { SlowLoadNotice } from "@/components/app/slow-load-notice";
import { Skeleton } from "@/components/ui/skeleton";

const TILES = [0, 1, 2, 3] as const;
const ROWS = [0, 1, 2, 3] as const;
const SLOW_LOAD_NOTICE_MS = 6_000;

export default function Loading() {
  const t = useTranslations("common");

  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{t("loading")}</span>
      <div aria-hidden="true" className="flex flex-col gap-6">
        <div className="panel-surface flex flex-col gap-3 rounded-xl border border-border bg-surface px-5 py-6">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-9 w-72 max-w-full" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {TILES.map((tile) => (
            <div
              key={tile}
              className="panel-surface rounded-xl border border-border bg-surface px-5 py-4"
            >
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-3 h-9 w-16" />
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="panel-surface rounded-xl border border-border bg-surface">
            <div className="border-b border-border px-5 py-4">
              <Skeleton className="h-4 w-36" />
            </div>
            <div className="flex flex-col gap-4 px-5 py-4">
              {ROWS.map((row) => (
                <div key={row} className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              ))}
            </div>
          </div>
          <div className="panel-surface rounded-xl border border-border bg-surface">
            <div className="border-b border-border px-5 py-4">
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="flex flex-col gap-3 px-5 py-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </div>
      </div>
      <SlowLoadNotice delayMs={SLOW_LOAD_NOTICE_MS}>{t("slowLoad")}</SlowLoadNotice>
    </div>
  );
}
