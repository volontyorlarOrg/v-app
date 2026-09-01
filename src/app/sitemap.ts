import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/api/env.server";
import { defaultLocale, locales } from "@/i18n/routing";
import { listOpportunitySlugs } from "@/features/opportunities/api.server";

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
