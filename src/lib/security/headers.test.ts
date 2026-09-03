import { describe, expect, it } from "vitest";

import {
  configuredTransportIsSecure,
  contentSecurityPolicy,
  securityHeaders,
} from "@/lib/security/headers";

const find = (secureTransport: boolean, key: string) =>
  securityHeaders({ development: !secureTransport, secureTransport }).find(
    (header) => header.key === key,
  );

describe("security headers", () => {
  it("enables transport directives only for a configured HTTPS origin", () => {
    expect(configuredTransportIsSecure("https://example.org")).toBe(true);
    expect(configuredTransportIsSecure("http://localhost:3211")).toBe(false);
    expect(configuredTransportIsSecure("")).toBe(false);
    expect(configuredTransportIsSecure("example.org")).toBe(false);
  });

  it("keeps the core document and resource restrictions in every environment", () => {
    for (const secureTransport of [true, false]) {
      const policy = contentSecurityPolicy({
        development: !secureTransport,
        secureTransport,
      });
      expect(policy).toContain("default-src 'self'");
      expect(policy).toContain("object-src 'none'");
      expect(policy).toContain("frame-ancestors 'none'");
      expect(policy).toContain("form-action 'self'");
      expect(find(secureTransport, "X-Frame-Options")?.value).toBe("DENY");
      expect(find(secureTransport, "X-Content-Type-Options")?.value).toBe("nosniff");
    }
  });

  it("keeps every response out of search engines, because every page is private", () => {
    for (const secureTransport of [true, false]) {
      expect(find(secureTransport, "X-Robots-Tag")?.value).toContain("noindex");
    }
  });

  it("upgrades insecure requests only where there is TLS to upgrade to", () => {
    expect(
      contentSecurityPolicy({ development: false, secureTransport: true }),
    ).toContain("upgrade-insecure-requests");
    expect(
      contentSecurityPolicy({ development: true, secureTransport: false }),
    ).not.toContain("upgrade-insecure-requests");
  });

  it("allows React diagnostics and hot reload connections only in development", () => {
    const developmentPolicy = contentSecurityPolicy({
      development: true,
      secureTransport: false,
    });
    const productionPolicy = contentSecurityPolicy({
      development: false,
      secureTransport: true,
    });

    expect(developmentPolicy).toContain(
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    );
    expect(developmentPolicy).toContain("connect-src 'self' ws:");
    expect(productionPolicy).toContain("script-src 'self' 'unsafe-inline'");
    expect(productionPolicy).toContain("connect-src 'self'");
    expect(productionPolicy).not.toMatch(/unsafe-eval|connect-src[^;]*ws:/);
  });

  it("sends HSTS only over a secure transport", () => {
    expect(find(true, "Strict-Transport-Security")?.value).toContain(
      "max-age=63072000",
    );
    expect(find(false, "Strict-Transport-Security")).toBeUndefined();
  });
});
