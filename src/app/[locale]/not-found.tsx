import { getTranslations } from "next-intl/server";
import { Compass } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";

/**
 * In-locale 404. Renders inside the app shell, so the header, navigation, and
 * language switcher still work — a dead link should not strand someone.
 */
export default async function NotFound() {
  const t = await getTranslations("errors.notFound");

  return (
    <EmptyState
      icon={<Compass />}
      title={t("title")}
      body={t("body")}
      action={
        <Button asChild>
          <Link href="/opportunities">{t("browse")}</Link>
        </Button>
      }
      className="my-12"
    />
  );
}
