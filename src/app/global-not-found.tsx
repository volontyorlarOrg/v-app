import { Onest, Source_Serif_4 } from "next/font/google";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

import { ThemeScript } from "@/components/app/theme-script";
import { BrandMark } from "@/components/brand/logo";
import uzMessages from "@/i18n/messages/uz.json";
import { defaultLocale, localeNames, locales } from "@/i18n/routing";
import { ORGANIZATION_NAME } from "@/lib/content/org";
import { HOME_ROUTE, localePath } from "@/lib/routing/routes";
import { siteOrigin } from "@/lib/seo/origin";
import "./globals.css";

const onest = Onest({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-onest",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-source-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: `${uzMessages.notFound.metaTitle} · ${ORGANIZATION_NAME}`,
  robots: { index: false, follow: false },
};

export default async function GlobalNotFound() {
  const messages = await Promise.all(
    locales.map(async (locale) => ({
      locale,
      t: await getTranslations({ locale, namespace: "notFound" }),
    })),
  );

  return (
    <html
      lang={defaultLocale}
      data-theme="light"
      suppressHydrationWarning
      className={`${onest.variable} ${sourceSerif.variable} h-full`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-full flex-col">
        <main className="container-page flex flex-1 flex-col justify-center py-20">
          <BrandMark className="size-12 text-primary" />
          <p className="mt-8 text-xs font-bold tracking-[0.14em] text-ink-muted uppercase">
            404
          </p>
          <ul className="mt-6 space-y-8">
            {messages.map(({ locale, t }, index) => {
              const Heading = index === 0 ? "h1" : "h2";

              return (
                <li key={locale} lang={locale}>
                  <Heading className="text-2xl tracking-[-0.025em] sm:text-3xl">
                    {t("title")}
                  </Heading>
                  <p className="mt-2 text-ink-muted">{t("description")}</p>
                  <a
                    href={localePath(locale, HOME_ROUTE)}
                    hrefLang={locale}
                    className="mt-3 inline-flex min-h-11 items-center font-semibold text-primary-ink underline underline-offset-4"
                  >
                    {t("action")}
                    <span className="ml-2 text-sm font-normal text-ink-muted">
                      ({localeNames[locale]})
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </main>
      </body>
    </html>
  );
}
