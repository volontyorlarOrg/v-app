import { getTranslations } from "next-intl/server";
import { CalendarX } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";

/**
 * A removed or expired opportunity gets its own message rather than a generic
 * 404 — an old Telegram link landing here is an ordinary event, and "this one
 * is gone, here is what is open" is more useful than "page not found".
 */
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
