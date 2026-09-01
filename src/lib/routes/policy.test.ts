import { describe, expect, it } from "vitest";
import { locales } from "@/i18n/routing";
import {
  isAuthPath,
  isIndexablePath,
  isProtectedPath,
  localeAlternates,
  robotsFor,
  stripLocale,
} from "./policy";

/**
 * Route policy.
 *
 * These are the tests that stop a privacy regression from shipping quietly.
 * The product deliberately does *not* copy the reference architecture's
 * blanket noindex, which means "is this route public?" is now a decision with
 * a wrong answer — and the wrong answer puts a volunteer's application history
 * into a search index.
 */

describe("stripLocale", () => {
  it("removes a supported locale prefix", () => {
    expect(stripLocale("/uz/opportunities", locales)).toBe("/opportunities");
    expect(stripLocale("/ru/applications/42", locales)).toBe("/applications/42");
  });

  it("leaves a path without a locale prefix alone", () => {
    expect(stripLocale("/opportunities", locales)).toBe("/opportunities");
  });

  it("does not mistake a path segment for a locale", () => {
    // `/entry` starts with `en` as a substring but is not the `en` segment.
    expect(stripLocale("/entry/thing", locales)).toBe("/entry/thing");
  });

  it("normalises the locale root to /", () => {
    expect(stripLocale("/uz", locales)).toBe("/");
    expect(stripLocale("/uz/", locales)).toBe("/");
  });

  it("drops a trailing slash so policy matching is exact", () => {
    expect(stripLocale("/uz/opportunities/", locales)).toBe("/opportunities");
  });
});

describe("isProtectedPath", () => {
  it.each([
    "/dashboard",
    "/profile",
    "/saved",
    "/applications",
    "/applications/42",
    "/record",
    "/settings",
    "/partner",
    "/admin",
  ])("protects %s", (path) => {
    expect(isProtectedPath(path)).toBe(true);
  });

  it.each(["/opportunities", "/opportunities/winter-drive", "/"])(
    "leaves %s public",
    (path) => {
      expect(isProtectedPath(path)).toBe(false);
    },
  );

  it("matches on a full segment, not a prefix string", () => {
    // `/savedthing` must not be treated as living under `/saved`.
    expect(isProtectedPath("/savedthing")).toBe(false);
  });
});

describe("isAuthPath", () => {
  it("covers the sign-in surfaces", () => {
    expect(isAuthPath("/login")).toBe(true);
    expect(isAuthPath("/auth/telegram")).toBe(true);
    expect(isAuthPath("/opportunities")).toBe(false);
  });
});

describe("isIndexablePath", () => {
  it("indexes opportunity discovery and detail", () => {
    expect(isIndexablePath("/opportunities")).toBe(true);
    expect(isIndexablePath("/opportunities/winter-book-drive")).toBe(true);
  });

  it("never indexes an account route", () => {
    for (const path of [
      "/dashboard",
      "/profile",
      "/saved",
      "/applications",
      "/applications/42",
      "/record",
      "/settings",
      "/admin",
      "/partner/applicants",
    ]) {
      expect(isIndexablePath(path)).toBe(false);
    }
  });

  it("never indexes sign-in", () => {
    expect(isIndexablePath("/login")).toBe(false);
  });

  it("is closed by default — an unlisted route is not indexable", () => {
    // A new route must be added to the allowlist deliberately; forgetting
    // keeps it private rather than exposing it.
    expect(isIndexablePath("/some-new-feature")).toBe(false);
    expect(isIndexablePath("/")).toBe(false);
  });
});

describe("robotsFor", () => {
  it("allows indexing on a public route", () => {
    expect(robotsFor("/opportunities")).toEqual({ index: true, follow: true });
  });

  it("blocks indexing and caching on a private route", () => {
    expect(robotsFor("/applications/42")).toEqual({
      index: false,
      follow: false,
      nocache: true,
    });
  });
});

describe("localeAlternates", () => {
  it("builds an absolute URL per locale", () => {
    expect(
      localeAlternates("https://app.example", "/opportunities", locales),
    ).toEqual({
      uz: "https://app.example/uz/opportunities",
      ru: "https://app.example/ru/opportunities",
      en: "https://app.example/en/opportunities",
    });
  });
});
