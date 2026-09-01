import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/api/env.server";
import { defaultLocale, locales } from "@/i18n/routing";
import { listOpportunitySlugs } from "@/features/opportunities/api.server";

/**
 * Sitemap for the indexable surface only.
 *
 * Contains the opportunity listing and the detail pages, each with `hreflang`
 * alternates so a Russian speaker searching in Russian is offered the Russian
 * URL rather than the Uzbek one.
 *
 * Private routes are absent by construction: the only entries are the ones
 * this file adds explicitly, so a new account page cannot leak in by default.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = siteOrigin();

  const alternatesFor = (path: string) => ({
    languages: Object.fromEntries(
      locales.map((locale) => [locale, `${origin}/${locale}${path}`]),
    ),
  });

  const entries: MetadataRoute.Sitemap = locales.map((locale) => ({
    url: `${origin}/${locale}/opportunities`,
    changeFrequency: "daily",
    priority: locale === defaultLocale ? 1 : 0.9,
    alternates: alternatesFor("/opportunities"),
  }));

  // Empty unless a source can enumerate slugs. An incomplete sitemap is
  // better than a fabricated one — a 404 from a submitted URL is a ranking
  // problem, and guessing slugs would guarantee them.
  const slugs = await listOpportunitySlugs();

  for (const slug of slugs) {
    const path = `/opportunities/${slug}`;
    for (const locale of locales) {
      entries.push({
        url: `${origin}/${locale}${path}`,
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: alternatesFor(path),
      });
    }
  }

  return entries;
}
