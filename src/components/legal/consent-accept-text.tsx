import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import type { Locale } from "@/i18n/routing";
import { marketingHref } from "@/lib/seo/origin";

function documentLink(href: string | null) {
  return function DocumentLink(chunks: ReactNode) {
    if (!href) return chunks;
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary-ink underline underline-offset-4"
      >
        {chunks}
      </a>
    );
  };
}

export function ConsentAcceptText({ locale }: { locale: Locale }) {
  const t = useTranslations("legal");
  return t.rich("form.accept", {
    privacy: documentLink(marketingHref(locale, "privacy")),
    terms: documentLink(marketingHref(locale, "terms")),
  });
}
