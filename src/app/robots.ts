import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/api/env.server";
import { PROTECTED_PREFIXES } from "@/lib/routes/policy";
import { locales } from "@/i18n/routing";

/**
 * robots.txt.
 *
 * The deliberate opposite of the Dwelve reference, which disallows everything
 * because its whole product is private. YVC's opportunity pages are the
 * acquisition funnel and are meant to be found; only the account area is shut
 * out. The disallow list is generated from the same `PROTECTED_PREFIXES` the
 * proxy enforces, so the two can never disagree.
 *
 * robots.txt alone would still leave link-discovered private URLs indexed as
 * bare stubs — the `X-Robots-Tag: noindex` the proxy sets is what actually
 * keeps them out. This file is the polite request; that header is the rule.
 */
export default function robots(): MetadataRoute.Robots {
  const origin = siteOrigin();

  const disallow = [
    "/api/",
    ...locales.flatMap((locale) =>
      [...PROTECTED_PREFIXES, "/login", "/auth"].map(
        (prefix) => `/${locale}${prefix}`,
      ),
    ),
  ];

  return {
    rules: [{ userAgent: "*", allow: "/", disallow }],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
