import type { Locale } from "@/i18n/routing";

const DEVELOPMENT_ORIGIN = "http://localhost:3001";

export type MarketingPage = "home" | "privacy" | "terms";

const MARKETING_PATHS: Record<MarketingPage, string> = {
  home: "",
  privacy: "/privacy",
  terms: "/terms",
};

function readOrigin(value: string | undefined): string | null {
  const raw = value?.trim();
  if (!raw) return null;

  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function hasVerifiedSiteOrigin(): boolean {
  return readOrigin(process.env.NEXT_PUBLIC_SITE_URL) !== null;
}

export function siteOrigin(): string {
  return readOrigin(process.env.NEXT_PUBLIC_SITE_URL) ?? DEVELOPMENT_ORIGIN;
}

export function siteUrl(path: string): string {
  return new URL(path, `${siteOrigin()}/`).toString();
}

export function marketingOrigin(): string | null {
  return readOrigin(process.env.NEXT_PUBLIC_MARKETING_URL);
}

export function marketingHref(locale: Locale, page: MarketingPage): string | null {
  const origin = marketingOrigin();
  if (!origin) return null;
  return new URL(`/${locale}${MARKETING_PATHS[page]}`, `${origin}/`).toString();
}
