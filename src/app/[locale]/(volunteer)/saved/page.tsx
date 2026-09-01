import { getTranslations, setRequestLocale } from "next-intl/server";
import { Bookmark } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { listSavedOpportunities } from "@/features/saved/api.server";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { ApiErrorState } from "@/components/shared/api-error-state";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/states";

/** Bookmarked opportunities. */
export default async function SavedPage(props: PageProps<"/[locale]/saved">) {
  const { locale } = await props.params;
  setRequestLocale(locale as Locale);

  const [t, nav] = await Promise.all([
    getTranslations("opportunities"),
    getTranslations("nav"),
  ]);

  let saved;

  try {
    saved = await listSavedOpportunities();
  } catch (error) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={t("saved.title")} description={t("saved.subtitle")} />
        <ApiErrorState error={error} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("saved.title")} description={t("saved.subtitle")} />

      {saved.items.length === 0 ? (
        <EmptyState
          icon={<Bookmark />}
          title={t("saved.emptyTitle")}
          body={t("saved.emptyBody")}
          action={
            <Button asChild>
              <Link href="/opportunities">{nav("opportunities")}</Link>
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {saved.items.map((opportunity) => (
            <li key={opportunity.id} className="flex">
              <OpportunityCard opportunity={opportunity} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
