import { useTranslations } from "next-intl";

import { SectionTabs, type SectionTab } from "@/components/app/section-tabs";
import { serializeOpportunitySearch } from "@/lib/opportunities/search-params";
import { navHref } from "@/lib/routing/routes";

export type OpportunityTab = "all" | "saved" | "applications";

export function OpportunitySectionTabs({
  current,
  savedCount,
  applicationCount,
  className,
}: {
  current: OpportunityTab;
  savedCount: number | null;
  applicationCount: number | null;
  className?: string;
}) {
  const t = useTranslations("opportunities.tabs");

  const items: SectionTab[] = [
    {
      key: "all",
      href: serializeOpportunitySearch(navHref("opportunities"), { view: "all" }),
      label: t("all"),
      active: current === "all",
    },
    {
      key: "saved",
      href: serializeOpportunitySearch(navHref("opportunities"), { view: "saved" }),
      label: t("saved"),
      active: current === "saved",
      ...(savedCount === null ? {} : { count: savedCount }),
    },
    {
      key: "applications",
      href: navHref("applications"),
      label: t("applications"),
      active: current === "applications",
      ...(applicationCount === null ? {} : { count: applicationCount }),
    },
  ];

  return <SectionTabs label={t("label")} items={items} className={className} />;
}
