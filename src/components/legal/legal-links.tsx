import { getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { marketingHref } from "@/lib/seo/origin";

export async function LegalLinks({ locale }: { locale: Locale }) {
  const t = await getTranslations("legal");
  const privacy = marketingHref(locale, "privacy");
  const terms = marketingHref(locale, "terms");
  if (!privacy || !terms) return null;
  return (
    <p className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
      <a className="text-primary-ink underline underline-offset-4" href={privacy}>
        {t("privacyPolicy")}
      </a>
      <a className="text-primary-ink underline underline-offset-4" href={terms}>
        {t("terms")}
      </a>
    </p>
  );
}
