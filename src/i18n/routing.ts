import { defineRouting } from "next-intl/routing";

/**
 * Supported locales, in the order they are offered in the language switcher.
 *
 * `uz` is the default because YVC's volunteers are in Uzbekistan and the
 * handoff's own canonical example URL is `/uz/opportunities?...`. This is a
 * product decision, not a technical constraint — flipping `defaultLocale`
 * below is the only change required.
 */
export const locales = ["uz", "ru", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "uz";

/**
 * BCP 47 tags for `Intl` and the `<html lang>` attribute. The URL segment is
 * the short form; formatting needs the region-qualified tag to pick the right
 * date order and number separators.
 */
export const localeTags: Record<Locale, string> = {
  uz: "uz-UZ",
  ru: "ru-RU",
  en: "en-US",
};

/** Endonyms — a language is always offered in its own language. */
export const localeLabels: Record<Locale, string> = {
  uz: "O'zbekcha",
  ru: "Русский",
  en: "English",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

export const routing = defineRouting({
  locales,
  defaultLocale,

  /**
   * Every URL carries its locale, including the default one.
   *
   * The alternative ('as-needed') hides the prefix for `uz` and resolves it
   * from a cookie. That breaks the product's main acquisition path: an
   * opportunity link pasted into a Telegram channel would render in a
   * different language for each reader, and the same URL would be two
   * different pages for search engines. An explicit prefix makes a shared
   * link mean exactly one thing.
   */
  localePrefix: "always",
});
