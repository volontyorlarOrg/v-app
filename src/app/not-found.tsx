import { defaultLocale, localeTags } from "@/i18n/routing";
import "./globals.css";

/**
 * Global 404, for a path that never reached a locale segment.
 *
 * Because the root layout lives at `app/[locale]/layout.tsx`, this file has no
 * layout above it and must supply its own `<html>` and `<body>`. It also
 * cannot use `useTranslations` — there is no resolved locale — so the copy is
 * the default locale's, and the page's job is simply to get the visitor back
 * onto a real, localised route.
 */
export default function GlobalNotFound() {
  return (
    <html lang={localeTags[defaultLocale]}>
      <body className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6 text-center">
        <h1 className="font-display text-2xl font-semibold">404</h1>
        <p className="text-muted">Bu sahifa topilmadi · Страница не найдена · Page not found</p>
        <a
          href={`/${defaultLocale}/opportunities`}
          className="inline-flex h-11 items-center rounded-lg bg-teal px-6 font-bold text-teal-ink"
        >
          Youth Volunteer Club
        </a>
      </body>
    </html>
  );
}
