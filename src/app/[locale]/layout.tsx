import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Manrope } from "next/font/google";
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
import { AppShell } from "@/components/shared/app-shell";
import "../globals.css";

/**
 * The root layout. It lives under `[locale]` so the locale is a *root
 * parameter*, which Next.js 16 makes readable from any Server Component
 * without prop drilling.
 */

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const body = Manrope({
  // Cyrillic is not optional here: Russian is a first-class locale, and
  // without this subset every Russian page falls back to a system font.
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#071719",
  // Zooming stays enabled. Locking it is a WCAG failure, and this product is
  // read on small phones by people who may need to scale text.
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
    // Default to noindex. Public routes opt *in* via their own metadata, so a
    // page added without thinking about indexing stays out of search results.
    robots: { index: false, follow: false },
  };
}

/** Prerenders one shell per locale. */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout(props: LayoutProps<"/[locale]">) {
  const { locale } = await props.params;

  // `[locale]` catches unknown top-level paths, so an invalid value here is a
  // 404 rather than a crash.
  if (!isLocale(locale)) notFound();

  const typedLocale: Locale = locale;
  setRequestLocale(typedLocale);

  // Read once at the shell. Passing the *public* projection means tokens
  // cannot reach the client bundle even by accident.
  const session = await getSession();
  const publicSession = session ? toPublicSession(session) : null;

  return (
    <html
      lang={localeTags[typedLocale]}
      className={`${display.variable} ${body.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh">
        {/*
          NuqsAdapter must wrap anything reading URL state; QueryProvider owns
          client server-state. NextIntlClientProvider is outermost so both can
          render translated fallbacks.
        */}
        <NextIntlClientProvider>
          <NuqsAdapter>
            <QueryProvider>
              <AppShell session={publicSession}>{props.children}</AppShell>
              <Toaster
                position="top-center"
                richColors
                // Matches the night field rather than sonner's light default.
                toastOptions={{
                  classNames: {
                    toast:
                      "!bg-panel !border-signal-line !text-ink !rounded-lg",
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
