import { useTranslations } from "next-intl";

import { Panel } from "@/components/app/panel";
import { buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { navHref } from "@/lib/routing/routes";

export default function VolunteerNotFound() {
  const t = useTranslations("notFound");

  return (
    <Panel className="mx-auto max-w-lg">
      <p className="text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase">
        404
      </p>
      <h1 className="mt-3 text-3xl tracking-[-0.025em]">{t("title")}</h1>
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
