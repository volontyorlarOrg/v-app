import { defaultLocale, localeTags } from "@/i18n/routing";
import "./globals.css";

export default function GlobalNotFound() {
  return (
    <html lang={localeTags[defaultLocale]}>
      <body className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6 text-center">
        <h1 className="text-2xl font-semibold">404</h1>
        <p className="text-ink-muted">
          Bu sahifa topilmadi · Страница не найдена · Page not found
        </p>
        <a
          href={`/${defaultLocale}/opportunities`}
          className="text-blue-deep-ink inline-flex h-11 items-center rounded-lg bg-blue-deep px-6 font-bold"
        >
          Youth Volunteer Club
        </a>
      </body>
    </html>
  );
}
