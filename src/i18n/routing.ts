import { defineRouting } from "next-intl/routing";

import { PREFERENCE_LOCALE_COOKIE } from "@/lib/preferences";

export const locales = ["uz", "ru", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "uz";

export const localeNames: Record<Locale, string> = {
  uz: "O‘zbekcha",
  ru: "Русский",
  en: "English",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
  localeCookie: PREFERENCE_LOCALE_COOKIE,
  alternateLinks: false,
});
