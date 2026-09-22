import type { Locale } from "@/i18n/routing";
import { isLocale } from "@/i18n/routing";
import { USERNAME_PATTERN } from "@/lib/account/username";

export const RESERVED_PROFILE_SEGMENTS = new Set([
  "_next",
  "_vercel",
  "about",
  "admin",
  "applications",
  "contact",
  "dashboard",
  "leaderboard",
  "login",
  "opportunities",
  "partners",
  "privacy",
  "profile",
  "profiles",
  "record",
  "saved",
  "settings",
  "signup",
  "staff",
  "terms",
  "volunteering",
  "welcome",
]);

export function publicProfileUsername(pathname: string): string | null {
  const match = /^\/([^/]+)\/?$/.exec(pathname);
  if (!match?.[1]) return null;
  let username: string;
  try {
    username = decodeURIComponent(match[1]).toLowerCase();
  } catch {
    return null;
  }
  if (!USERNAME_PATTERN.test(username)) return null;
  return RESERVED_PROFILE_SEGMENTS.has(username) ? null : username;
}

export function internalProfileUsername(pathname: string): string | null {
  const match = /^\/(?:uz|ru|en)\/profiles\/([a-z0-9_]{5,32})\/?$/.exec(pathname);
  return match?.[1] ?? null;
}

export function memberProfileHref(username: string): string {
  return `/${encodeURIComponent(username.toLowerCase())}`;
}

export function internalMemberProfileHref(locale: Locale, username: string): string {
  return `/${locale}/profiles/${encodeURIComponent(username.toLowerCase())}`;
}

export function preferredProfileLocale(
  cookie: string | undefined,
  acceptLanguage: string | null,
): Locale {
  if (isLocale(cookie)) return cookie;
  const requested = (acceptLanguage ?? "")
    .split(",")
    .map((part) => {
      const [tag = "", quality = "q=1"] = part.trim().split(";");
      return {
        locale: tag.toLowerCase().split("-")[0],
        quality: Number(quality.replace(/^q=/, "")) || 0,
      };
    })
    .sort((a, b) => b.quality - a.quality)
    .find((item) => isLocale(item.locale))?.locale;
  return isLocale(requested) ? requested : "uz";
}
