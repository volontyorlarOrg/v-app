import { getTranslations } from "next-intl/server";
import { CalendarX } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";

export default async function OpportunityNotFound() {
  const t = await getTranslations("errors");

  return (
    <EmptyState
      icon={<CalendarX />}
      title={t("opportunityNotFound.title")}
      body={t("opportunityNotFound.body")}
      action={
        <Button asChild>
          <Link href="/opportunities">{t("notFound.browse")}</Link>
        </Button>
      }
      className="my-12"
    />
  );
}
