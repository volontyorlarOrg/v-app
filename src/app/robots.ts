import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/api/env.server";
import { PROTECTED_PREFIXES } from "@/lib/routes/policy";
import { locales } from "@/i18n/routing";

export default function robots(): MetadataRoute.Robots {
  const origin = siteOrigin();

  const disallow = [
    "/api/",
    ...locales.flatMap((locale) =>
      [...PROTECTED_PREFIXES, "/login", "/auth"].map((prefix) => `/${locale}${prefix}`),
    ),
  ];

  return {
    rules: [{ userAgent: "*", allow: "/", disallow }],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
