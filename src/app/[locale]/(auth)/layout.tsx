import { getTranslations, setRequestLocale } from "next-intl/server";

import { LocaleSwitcher } from "@/components/app/locale-switcher";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { BrandLockup } from "@/components/brand/logo";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { ORGANIZATION_NAME } from "@/lib/content/org";
import { ENTRY_ROUTE, navHref } from "@/lib/routing/routes";
import { marketingHref } from "@/lib/seo/origin";

export default async function AuthLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "nav" });
  const site = marketingHref(locale as Locale, "home");
  const lockup = <BrandLockup name={ORGANIZATION_NAME} />;

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-action focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-knockout"
      >
        {t("skipToContent")}
      </a>
      <header className="container-page flex min-h-16 items-center justify-between gap-4">
        {site ? (
          <a href={site} className="-m-1 rounded-md p-1" aria-label={ORGANIZATION_NAME}>
            {lockup}
          </a>
        ) : (
          <Link
            href={navHref(ENTRY_ROUTE)}
            className="-m-1 rounded-md p-1"
            aria-label={ORGANIZATION_NAME}
          >
            {lockup}
          </Link>
        )}
        <div className="flex items-center gap-1">
          <LocaleSwitcher label={t("languageLabel")} />
          <ThemeToggle label={t("themeLabel")} />
        </div>
      </header>
      <main
        id="main"
        className="container-page flex flex-1 flex-col justify-center py-6"
      >
        <div className="mx-auto w-full max-w-sm">{children}</div>
      </main>
    </>
  );
}
