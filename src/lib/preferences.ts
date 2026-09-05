export const PREFERENCE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

function hostname(value: string | undefined): string | null {
  const raw = value?.trim();
  if (!raw) return null;
  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
}

export function sharedCookieDomain(
  hostnames: readonly (string | null)[],
): string | undefined {
  const distinct = [...new Set(hostnames.filter((host) => host !== null))];
  if (distinct.length < 2) return undefined;

  const labelLists = distinct.map((host) => host.split(".").reverse());
  const shortest = Math.min(...labelLists.map((labels) => labels.length));
  const common: string[] = [];

  for (let index = 0; index < shortest; index += 1) {
    const label = labelLists[0]?.[index];
    if (label === undefined) break;
    if (!labelLists.every((labels) => labels[index] === label)) break;
    common.push(label);
  }

  if (common.length < 2) return undefined;
  return `.${common.reverse().join(".")}`;
}

const CONFIGURED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.NEXT_PUBLIC_APP_ORIGIN,
  process.env.NEXT_PUBLIC_MARKETING_URL,
];

export const PREFERENCE_COOKIE_DOMAIN = sharedCookieDomain(
  CONFIGURED_ORIGINS.map(hostname),
);

export const PREFERENCE_COOKIE_SECURE = CONFIGURED_ORIGINS.some(
  (origin) => origin?.trim().startsWith("https:") === true,
);

export const PREFERENCE_LOCALE_COOKIE: {
  name: string;
  path: string;
  sameSite: "lax";
  maxAge: number;
  domain?: string;
  secure?: boolean;
} = {
  name: LOCALE_COOKIE_NAME,
  path: "/",
  sameSite: "lax",
  maxAge: PREFERENCE_COOKIE_MAX_AGE,
  ...(PREFERENCE_COOKIE_DOMAIN ? { domain: PREFERENCE_COOKIE_DOMAIN } : {}),
  ...(PREFERENCE_COOKIE_SECURE ? { secure: true } : {}),
};

export function preferenceCookie(name: string, value: string): string {
  const parts = [
    `${name}=${value}`,
    "path=/",
    `max-age=${PREFERENCE_COOKIE_MAX_AGE}`,
    "samesite=lax",
  ];
  if (PREFERENCE_COOKIE_DOMAIN) parts.push(`domain=${PREFERENCE_COOKIE_DOMAIN}`);
  if (PREFERENCE_COOKIE_SECURE) parts.push("secure");
  return parts.join("; ");
}

export function readPreferenceCookie(name: string): string | null {
  try {
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
    const value = match?.[1];
    return value === undefined ? null : decodeURIComponent(value);
  } catch {
    return null;
  }
}

export function writePreferenceCookie(name: string, value: string) {
  try {
    document.cookie = preferenceCookie(name, value);
    if (PREFERENCE_COOKIE_DOMAIN && readPreferenceCookie(name) !== value) {
      document.cookie = [
        `${name}=${value}`,
        "path=/",
        `max-age=${PREFERENCE_COOKIE_MAX_AGE}`,
        "samesite=lax",
        ...(PREFERENCE_COOKIE_SECURE ? ["secure"] : []),
      ].join("; ");
    }
  } catch {}
}
