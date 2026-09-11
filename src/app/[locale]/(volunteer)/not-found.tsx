import { useTranslations } from "next-intl";

import { Panel } from "@/components/app/panel";
import { buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { navHref } from "@/lib/routing/routes";

export default function VolunteerNotFound() {
  const t = useTranslations("notFound");

  return (
    <Panel className="mx-auto mt-6 max-w-lg text-center">
      <h1 className="text-3xl tracking-[-0.025em] text-balance sm:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-2 text-ink-muted">{t("description")}</p>
      <Link
        href={navHref("dashboard")}
        className={buttonClass({ size: "sm", className: "mt-6" })}
      >
        {t("action")}
      </Link>
    </Panel>
  );
}
