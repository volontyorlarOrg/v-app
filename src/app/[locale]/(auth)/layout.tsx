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
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-action focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-knockout"
      >
        {t("skipToContent")}
      </a>
      <header className="container-page flex min-h-16 items-center justify-between gap-4 lg:min-h-20">
        {site ? (
          <a href={site} className="-m-1 rounded-lg p-1" aria-label={ORGANIZATION_NAME}>
            {lockup}
          </a>
        ) : (
          <Link
            href={navHref(ENTRY_ROUTE)}
            className="-m-1 rounded-lg p-1"
            aria-label={ORGANIZATION_NAME}
          >
            {lockup}
          </Link>
        )}
        <div className="flex items-center gap-2">
          <LocaleSwitcher label={t("languageLabel")} />
          <ThemeToggle label={t("themeLabel")} />
        </div>
      </header>
      <main
        id="main"
        className="container-page flex flex-1 flex-col justify-center py-8 sm:py-14"
      >
        <div className="mx-auto w-full max-w-md">{children}</div>
      </main>
      <footer className="container-page flex flex-col gap-2 py-6 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {ORGANIZATION_NAME}
        </p>
        {site ? (
          <a
            href={site}
            className="font-semibold text-primary-ink underline-offset-4 hover:underline"
          >
            {t("marketingSite")}
          </a>
        ) : null}
      </footer>
    </>
  );
}
