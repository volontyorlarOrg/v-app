import "server-only";

/**
 * Server-only environment access.
 *
 * Every value here is read through a function rather than exported as a
 * constant so that a missing variable fails at the call site, with a message
 * naming the variable, instead of at module load where the stack says nothing.
 *
 * Nothing in this file may ever be prefixed `NEXT_PUBLIC_`: these are the
 * credentials and origins that must not reach a browser bundle.
 */

/** Public opportunity reads. May be the same origin as the private API. */
export function publicApiBaseUrl(): string | null {
  const value = process.env.YVC_API_BASE_URL?.trim();
  return value ? value.replace(/\/+$/, "") : null;
}

/** Authenticated traffic. Falls back to the public origin when unset. */
export function privateApiBaseUrl(): string | null {
  const value = process.env.YVC_API_BASE_URL?.trim();
  return value ? value.replace(/\/+$/, "") : null;
}

/**
 * The 32-byte secret that encrypts the session cookie.
 *
 * Returns `null` rather than throwing so that a deployment without auth
 * configured still serves public opportunity pages. Callers that need a
 * session must treat `null` as "authentication is not configured".
 */
export function sessionSecret(): string | null {
  const value = process.env.YVC_SESSION_SECRET?.trim();
  return value && value.length >= 32 ? value : null;
}

/**
 * Whether the app is allowed to serve built-in sample opportunities.
 *
 * There is no YVC backend yet (see docs/api/API_CONTRACT.md). Rather than ship
 * an app that renders nothing, an explicit opt-in serves a small, clearly
 * labelled sample set so the UI, the tests, and local development have
 * something to run against. It is off unless deliberately enabled, and the UI
 * says on screen that the data is sample data.
 */
export function sampleDataEnabled(): boolean {
  return process.env.YVC_ENABLE_SAMPLE_DATA === "true";
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/** Canonical origin for absolute URLs in metadata. */
export function siteOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_ORIGIN?.trim().replace(/\/+$/, "") ??
    "http://localhost:3000"
  );
}
