import { getRequestConfig } from "next-intl/server";
import { EVENT_TIME_ZONE } from "@/lib/datetime";
import { defaultLocale, isLocale, localeTags, type Locale } from "./routing";

/**
 * Per-request i18n configuration.
 *
 * Message catalogues are split by domain and merged here, so no single file
 * grows into the thousand-key blob that nobody can review. Adding a domain
 * means adding a file to `src/i18n/messages/<locale>/` and one line below.
 */
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

  // `[locale]` acts as a catch-all, so an unknown segment (`/favicon.png`,
  // `/wp-admin`) arrives here as a bogus "locale". Fall back rather than
  // throwing: the route itself will 404, and a crash here would take out the
  // not-found page too.
  const locale: Locale = isLocale(requested) ? requested : defaultLocale;

  return {
    locale,

    // Formatting follows the region-qualified tag, not the URL segment.
    formats: {
      dateTime: {
        short: { day: "numeric", month: "short", year: "numeric" },
        long: { day: "numeric", month: "long", year: "numeric" },
        time: { hour: "2-digit", minute: "2-digit" },
      },
    },

    messages: await loadMessages(locale),

    // Deadlines are the one place this product must not be ambiguous, so all
    // dates render in the timezone the events actually happen in rather than
    // the viewer's — a volunteer opening a link abroad still sees the local
    // closing time. The same constant drives the "closes in N days" maths, so
    // the badge and the date under it can never disagree.
    timeZone: EVENT_TIME_ZONE,

    onError(error) {
      // A missing key is a content bug, not a page-breaking one. Log it and
      // let next-intl render the key path so it is visible in review.
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[i18n] ${error.message}`);
      }
    },
  };
});

export { localeTags };
