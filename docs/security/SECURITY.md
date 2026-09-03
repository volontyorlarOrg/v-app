# Application Security Boundary

## Implemented

`next.config.ts` disables the framework fingerprint and sends these headers on
every response, built by `src/lib/security/headers.ts`:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-DNS-Prefetch-Control: on`
- `X-Robots-Tag: noindex, nofollow, noarchive` — every screen is private
- `Permissions-Policy` denying camera, microphone, geolocation, and
  browsing-topics
- `Strict-Transport-Security` and `upgrade-insecure-requests` only when
  `NEXT_PUBLIC_SITE_URL` is an HTTPS origin
- a first-party-only Content Security Policy, identical to the marketing
  site's

The root layout also sends `robots: noindex` in the document, and
`robots.txt` disallows everything.

**Known weakness:** `script-src` and `style-src` allow `'unsafe-inline'`, for
the same reason the marketing site does. Revisit when a third-party script is
introduced; Phase C of the plan adds `https://accounts.google.com` to
`form-action`.

## Trust boundary

The application has no accounts, sessions, or backend transport yet. The three
forms submit nothing: `AuthForm` prevents the default and navigates. No cookie
is set. The one browser-storage value is the light/dark theme choice in
`localStorage`, which never reaches the server. Nothing personal appears in a
URL; the reset flow carries only `?reset=sent`.

Outbound links to the marketing site open with `rel="noopener noreferrer"`.

## Not implemented

- authentication, authorisation, or session handling
- form submission, validation, or rate limiting
- analytics, monitoring, or error reporting
- Telegram or Google verification

All of it is designed in
[`../plans/AUTH_AND_DASHBOARD_IMPLEMENTATION_PLAN.md`](../plans/AUTH_AND_DASHBOARD_IMPLEMENTATION_PLAN.md),
with the trust boundary — the browser never verifies an identity, the backend
authorises every operation, tokens never reach JavaScript — stated per phase.

## Secrets

The application requires no secret to install, lint, typecheck, test, or
build, and CI supplies none. Both supported variables are `NEXT_PUBLIC_*` and
embedded in the browser bundle by design. The plan introduces
`VOLONTYORLAR_SESSION_SECRET` and `VOLONTYORLAR_API_URL` as server-only
values; neither may ever carry a `NEXT_PUBLIC_` prefix.

## Needs verification

- Whether the eventual host applies or overrides these headers
- Cookie domain and SameSite behaviour inside the Telegram in-app browser
- HTTPS behaviour and HSTS preload eligibility on the production origin
