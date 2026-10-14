import {
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_PATTERN,
} from "@/lib/account/username";

export const RESERVED_PROFILE_SEGMENTS = new Set([
  "_next",
  "_vercel",
  "about",
  "admin",
  "applications",
  "checkpoints",
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
  if (!isUsername(username)) return null;
  return RESERVED_PROFILE_SEGMENTS.has(username) ? null : username;
}

function isUsername(value: string): boolean {
  return (
    value.length >= USERNAME_MIN_LENGTH &&
    value.length <= USERNAME_MAX_LENGTH &&
    USERNAME_PATTERN.test(value)
  );
}

export function internalProfileUsername(pathname: string): string | null {
  const match = /^\/profiles\/([^/]+)\/?$/.exec(pathname);
  return match?.[1] && isUsername(match[1]) ? match[1] : null;
}

export function memberProfileHref(username: string): string {
  return `/${encodeURIComponent(username.toLowerCase())}`;
}

export function internalMemberProfileHref(username: string): string {
  return `/profiles/${encodeURIComponent(username.toLowerCase())}`;
}
