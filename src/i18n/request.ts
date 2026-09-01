import { getRequestConfig } from "next-intl/server";
import { EVENT_TIME_ZONE } from "@/lib/datetime";
import { defaultLocale, isLocale, localeTags, type Locale } from "./routing";

const namespaces = [
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

async function loadMessages(locale: Locale) {
  const catalogues = await Promise.all(
    namespaces.map(
      (namespace) =>
        import(`./messages/${locale}/${namespace}.json`) as Promise<{
          default: Record<string, unknown>;
        }>,
    ),
  );

  return Object.fromEntries(
    namespaces.map((namespace, index) => [namespace, catalogues[index]!.default]),
  );
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;

  const locale: Locale = isLocale(requested) ? requested : defaultLocale;

  return {
    locale,

    formats: {
      dateTime: {
        short: { day: "numeric", month: "short", year: "numeric" },
        long: { day: "numeric", month: "long", year: "numeric" },
        time: { hour: "2-digit", minute: "2-digit" },
      },
    },

    messages: await loadMessages(locale),

    timeZone: EVENT_TIME_ZONE,

    onError(error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[i18n] ${error.message}`);
      }
    },
  };
});

export { localeTags };
