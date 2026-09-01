import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, type RenderOptions } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement, ReactNode } from "react";
import { EVENT_TIME_ZONE } from "@/lib/datetime";
import { defaultLocale, type Locale } from "@/i18n/routing";

/**
 * Renders a component with the **real** message catalogues.
 *
 * Not a stub `t` that echoes its key: half of what these tests are for is
 * catching a missing or malformed translation, and a stub would make every
 * such bug invisible. Rendering the real Uzbek catalogue means a test can
 * assert on the actual string a volunteer sees.
 */

const MESSAGES_DIR = join(process.cwd(), "src/i18n/messages");

const NAMESPACES = [
  "common",
  "nav",
  "auth",
  "opportunities",
  "applications",
  "profile",
  "record",
  "errors",
  "validation",
] as const;

const cache = new Map<Locale, Record<string, unknown>>();

export function messagesFor(locale: Locale): Record<string, unknown> {
  const cached = cache.get(locale);
  if (cached) return cached;

  const messages = Object.fromEntries(
    NAMESPACES.map((namespace) => [
      namespace,
      JSON.parse(
        readFileSync(join(MESSAGES_DIR, locale, `${namespace}.json`), "utf8"),
      ) as unknown,
    ]),
  );

  cache.set(locale, messages);
  return messages;
}

export function renderWithIntl(
  ui: ReactElement,
  {
    locale = defaultLocale,
    ...options
  }: Omit<RenderOptions, "wrapper"> & { locale?: Locale } = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <NextIntlClientProvider
        locale={locale}
        messages={messagesFor(locale)}
        // Pinned so a date assertion does not depend on where CI runs.
        timeZone={EVENT_TIME_ZONE}
        now={new Date("2026-06-15T12:00:00.000Z")}
        formats={{
          dateTime: {
            short: { day: "numeric", month: "short", year: "numeric" },
            long: { day: "numeric", month: "long", year: "numeric" },
            time: { hour: "2-digit", minute: "2-digit" },
          },
        }}
      >
        {children}
      </NextIntlClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}
