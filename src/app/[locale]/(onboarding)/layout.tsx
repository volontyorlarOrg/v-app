import { getTranslations, setRequestLocale } from "next-intl/server";

import { LocaleSwitcher } from "@/components/app/locale-switcher";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { BrandLockup } from "@/components/brand/logo";
import { Link } from "@/i18n/navigation";
import { ORGANIZATION_NAME } from "@/lib/content/org";
import { HOME_ROUTE, navHref } from "@/lib/routing/routes";

export const dynamic = "force-dynamic";

export default async function OnboardingLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "nav" });

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-action focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-knockout"
      >
        {t("skipToContent")}
      </a>
      <header className="container-page flex min-h-16 items-center justify-between gap-4">
        <Link
          href={navHref(HOME_ROUTE)}
          className="-m-1 rounded-lg p-1"
          aria-label={`${ORGANIZATION_NAME} — ${t("dashboard")}`}
        >
          <BrandLockup name={ORGANIZATION_NAME} />
        </Link>
        <div className="flex items-center gap-2">
          <LocaleSwitcher label={t("languageLabel")} />
          <ThemeToggle label={t("themeLabel")} />
        </div>
      </header>
      <main id="main" className="container-page flex flex-1 flex-col py-6 lg:py-10">
        {children}
      </main>
    </>
  );
}
