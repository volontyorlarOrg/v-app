import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/**
 * Headers applied to every response.
 *
 * Note what is deliberately *absent*: a blanket `X-Robots-Tag: noindex`. The
 * marketing repository is fully non-indexable, but this product is not — public
 * opportunity pages are discoverable content and are the top of the acquisition
 * funnel. Indexing is decided per route instead: `src/proxy.ts` stamps
 * `noindex` + `no-store` on private paths, and every public route exports its
 * own `robots` metadata. See docs/architecture/DOMAINS_AND_INDEXING.md.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Typed `Link` hrefs and route literals. Catches a dead internal link at
  // build time rather than when a volunteer taps it.
  typedRoutes: true,

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
