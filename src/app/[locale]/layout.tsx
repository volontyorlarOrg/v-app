import type { Metadata, Viewport } from "next";
import { Onest } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { notFound } from "next/navigation";
import { Toaster } from "sonner";
import { isLocale, locales, localeTags, type Locale } from "@/i18n/routing";
import { QueryProvider } from "@/lib/query/QueryProvider";
import { siteOrigin } from "@/lib/api/env.server";
import { getSession } from "@/lib/auth/session.server";
import { toPublicSession } from "@/lib/auth/session";
import { PALETTE } from "@/lib/design/palette";
import { AppShell } from "@/components/shared/app-shell";
import "../globals.css";

const onest = Onest({
  subsets: ["latin", "cyrillic"],
  variable: "--font-onest",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: PALETTE.blue,
  maximumScale: 5,
};

export async function generateMetadata(
  props: LayoutProps<"/[locale]">,
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "common" });

  return {
    metadataBase: new URL(siteOrigin()),
    title: {
      default: t("appName"),
      template: `%s · ${t("appShortName")}`,
    },
    description: t("tagline"),
    applicationName: t("appName"),
    robots: { index: false, follow: false },
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout(props: LayoutProps<"/[locale]">) {
  const { locale } = await props.params;

  if (!isLocale(locale)) notFound();

  const typedLocale: Locale = locale;
  setRequestLocale(typedLocale);

  const session = await getSession();
  const publicSession = session ? toPublicSession(session) : null;

  return (
    <html
      lang={localeTags[typedLocale]}
      className={onest.variable}
      suppressHydrationWarning
    >
      <body className="min-h-dvh">
        <NextIntlClientProvider>
          <NuqsAdapter>
            <QueryProvider>
              <AppShell session={publicSession}>{props.children}</AppShell>
              <Toaster
                position="top-center"
                toastOptions={{
                  classNames: {
                    toast: "!bg-canvas !border-line !text-ink !rounded-lg !shadow-lg",
                    description: "!text-ink-muted",
                    actionButton: "!bg-blue-deep !text-knockout",
                  },
                }}
              />
            </QueryProvider>
          </NuqsAdapter>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
