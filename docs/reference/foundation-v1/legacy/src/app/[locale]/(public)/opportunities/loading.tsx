import { getTranslations } from "next-intl/server";
import { LoadingRegion, Skeleton } from "@/components/ui/states";

export default async function OpportunitiesLoading() {
  const t = await getTranslations("common.state");

  return (
    <LoadingRegion label={t("loading")} className="flex flex-col gap-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-11 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-56 w-full rounded-card" />
        ))}
      </div>
    </LoadingRegion>
  );
}
