import "server-only";

export function publicApiBaseUrl(): string | null {
  const value = process.env.YVC_API_BASE_URL?.trim();
  return value ? value.replace(/\/+$/, "") : null;
}

export function privateApiBaseUrl(): string | null {
  const value = process.env.YVC_API_BASE_URL?.trim();
  return value ? value.replace(/\/+$/, "") : null;
}

export function sessionSecret(): string | null {
  const value = process.env.YVC_SESSION_SECRET?.trim();
  return value && value.length >= 32 ? value : null;
}

export function sampleDataEnabled(): boolean {
  return process.env.YVC_ENABLE_SAMPLE_DATA === "true";
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function siteOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_ORIGIN?.trim().replace(/\/+$/, "") ??
    "http://localhost:3000"
  );
}
