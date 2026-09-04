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
`form-action`. Telegram sign-in needed no CSP change: the redirect to `t.me`
is a navigation, and the API calls are server-to-server.

## Trust boundary

The browser never verifies an identity. Telegram proves who the volunteer is,
`v-backend` verifies that proof with the bot token and issues the tokens, and
this application only decides what is worth rendering. Every write is still
authorised by the backend.

Sign-in turns on only when both `VOLONTYORLAR_API_URL` and
`VOLONTYORLAR_SESSION_SECRET` are set. While either is blank the application
keeps its earlier behaviour: no cookie, no guarded route, and the Telegram
button is a labelled preview like the other two methods.

### The session cookie

`volontyorlar_session` holds the backend's access token, its expiry, the
refresh token, the user id, roles and display name, encrypted as a JWE
(`dir` + `A256GCM`, the key being SHA-256 of `VOLONTYORLAR_SESSION_SECRET`).
It is `httpOnly`, `sameSite=lax`, `path=/`, `secure` in production, and lives
30 days. No token is readable by JavaScript, appears in a URL, or reaches
browser storage. A tampered or wrongly-keyed cookie decrypts to `null` and is
treated as signed out rather than trusted.

`src/proxy.ts` reads it on every app request and enforces the `guard` each
route declares in `src/lib/routing/routes.ts`: a signed-out visitor to a
volunteer route is redirected to `/{locale}/login?next=…`, a signed-in visitor
to an auth route is redirected to the dashboard, and signed-in responses carry
`Cache-Control: private, no-store`. `(volunteer)/layout.tsx` checks the session
again as defence in depth. `next` is filtered through `safeReturnPath`, which
rejects anything that could leave this origin.

An access token inside its expiry skew is rotated in the proxy, on document
navigations only, and the new cookie is written on that response. A refresh
that fails clears the cookie and sends the volunteer to sign in again.
Rotation is single-use at the backend, so two navigations racing across the
skew window can spend the same refresh token and sign the volunteer out early;
the window is narrow and the cost is one extra sign-in.

Sign-out is a Server Action, not a link, so it cannot be triggered by a
prefetch or a cross-site request. It revokes the refresh token at the backend
first, then clears the cookie, then redirects — and works without JavaScript.

Two short-lived `httpOnly` cookies carry the handoff into Telegram:
`volontyorlar_return_to` and `volontyorlar_auth_locale`, both 15 minutes, both
deleted on completion. The volunteer usually finishes in Telegram's own
browser, which does not share them, so the backend also echoes the locale back
on the completion link and the destination falls back to the dashboard.

The one browser-storage value remains the light/dark theme choice in
`localStorage`. Nothing personal appears in a URL; the reset flow carries only
`?reset=sent` and sign-in carries only `?telegram=expired|unavailable`.

Outbound links to the marketing site open with `rel="noopener noreferrer"`.

## Not implemented

- Google and email/password sign-in; both remain labelled previews
- account linking, settings, and "sign out everywhere"
- form submission, validation, or rate limiting for the email forms
- analytics, monitoring, or error reporting

They are designed in
[`../plans/AUTH_AND_DASHBOARD_IMPLEMENTATION_PLAN.md`](../plans/AUTH_AND_DASHBOARD_IMPLEMENTATION_PLAN.md).

## Secrets

The application still requires no secret to install, lint, typecheck, test, or
build, and CI supplies none. The two `NEXT_PUBLIC_*` variables are embedded in
the browser bundle by design.

`VOLONTYORLAR_API_URL` and `VOLONTYORLAR_SESSION_SECRET` are server-only.
Neither may ever carry a `NEXT_PUBLIC_` prefix; `src/lib/api/client.server.ts`
and `src/lib/auth/session.server.ts` import `server-only` so an accidental
client import fails the build. The bot token lives in `v-backend` and never
enters this deployment — see
[`../../../v-backend/docs/operations/TELEGRAM_BOT_SETUP.md`](../../../v-backend/docs/operations/TELEGRAM_BOT_SETUP.md)
for how the keys are obtained and set.

## Needs verification

- Whether the eventual host applies or overrides these headers
- Cookie behaviour inside the Telegram in-app browser on the real production
  origin, which is where the completion link is opened
- HTTPS behaviour and HSTS preload eligibility on the production origin
