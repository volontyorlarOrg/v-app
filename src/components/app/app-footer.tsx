import { useLocale, useTranslations } from "next-intl";

import type { Locale } from "@/i18n/routing";
import { ORGANIZATION_NAME } from "@/lib/content/org";
import { marketingHref } from "@/lib/seo/origin";

const linkClass =
  "inline-flex min-h-9 items-center font-semibold text-ink-muted hover:text-primary-ink";

export function AppFooter() {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;

  const links = (["home", "privacy", "terms"] as const).flatMap((page) => {
    const href = marketingHref(locale, page);
    return href ? [{ page, href }] : [];
  });

  return (
    <footer className="mb-16 lg:mb-0">
      <div className="mx-auto flex w-full max-w-[80rem] flex-col gap-2 px-4 py-5 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>
          © {new Date().getFullYear()} {ORGANIZATION_NAME}
        </p>
        {links.length > 0 ? (
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            {links.map(({ page, href }) => (
              <li key={page}>
                <a href={href} rel="noopener noreferrer" className={linkClass}>
                  {t(page === "home" ? "marketingSite" : page)}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </footer>
  );
}
