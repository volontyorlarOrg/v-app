import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  hasVerifiedSiteOrigin,
  marketingHref,
  marketingOrigin,
  siteOrigin,
  siteUrl,
} from "@/lib/seo/origin";

describe("application origin", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
  });

  it("is unverified and local when nothing is configured", () => {
    expect(hasVerifiedSiteOrigin()).toBe(false);
    expect(siteOrigin()).toBe("http://localhost:3001");
  });

  it("normalises a configured origin, dropping any path", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://app.example.org/some/path");
    expect(hasVerifiedSiteOrigin()).toBe(true);
    expect(siteOrigin()).toBe("https://app.example.org");
    expect(siteUrl("/opengraph-image.png")).toBe(
      "https://app.example.org/opengraph-image.png",
    );
  });

  it("rejects a value that is not an http(s) origin", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "example.org");
    expect(hasVerifiedSiteOrigin()).toBe(false);
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "javascript:alert(1)");
    expect(hasVerifiedSiteOrigin()).toBe(false);
  });
});

describe("marketing site origin", () => {
  it("is null until it is verified, and never guessed", () => {
    vi.stubEnv("NEXT_PUBLIC_MARKETING_URL", "");
    expect(marketingOrigin()).toBeNull();
    expect(marketingHref("uz", "privacy")).toBeNull();
  });

  it("builds localized page links once configured", () => {
    vi.stubEnv("NEXT_PUBLIC_MARKETING_URL", "https://example.org");
    expect(marketingHref("uz", "home")).toBe("https://example.org/uz");
    expect(marketingHref("ru", "privacy")).toBe("https://example.org/ru/privacy");
    expect(marketingHref("en", "terms")).toBe("https://example.org/en/terms");
  });
});
