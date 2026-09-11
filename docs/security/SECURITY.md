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
introduced. Neither Telegram nor Google sign-in needed a CSP change: both
buttons are ordinary navigations, Google's answer is a form post it serves
itself under its own policy, and no provider script is loaded. `form-action`
stays `'self'`.

## Trust boundary

The browser never verifies an identity. Telegram proves who the volunteer is,
`v-backend` redeems the authorization code with the client secret, verifies
the ID token against Telegram's published keys and issues the tokens, and
this application only decides what is worth rendering. Every write is still
authorised by the backend.

Sign-in needs both `VOLONTYORLAR_API_URL` and `VOLONTYORLAR_SESSION_SECRET`.
The route guards in `src/proxy.ts` do not depend on them: a `(volunteer)` URL
without a valid cookie is always redirected to `/login?next=`. While either
value is blank no cookie can be written and the Telegram handoff returns to
`/login?telegram=unavailable`, so the application is closed rather than open.

The cookie is `Secure` in a production build unless `NEXT_PUBLIC_SITE_URL` is
explicitly an `http:` origin, so a production build served locally over plain
HTTP (the Playwright suite) still receives its own cookie.

### The session cookie

`volontyorlar_session` holds the backend's session token, its expiry, the user
id, roles and display name, encrypted as a JWE (`dir` + `A256GCM`, the key being
SHA-256 of `VOLONTYORLAR_SESSION_SECRET`). It is `httpOnly`, `sameSite=lax`,
`path=/`, `secure` in production, and lives three days — the same three days as
the token inside it, set from the backend's `SESSION_TTL_SECONDS`. The two
lifetimes are deliberately equal: a cookie outliving its token would leave a
volunteer looking signed in while every request came back 401. There is one
token and nothing to renew, so a session ends exactly once, when it runs out.
No token is readable by JavaScript, appears in a URL, or reaches browser
storage. A tampered or wrongly-keyed cookie decrypts to `null` and is treated as
signed out rather than trusted.

`src/proxy.ts` reads it on every app request and enforces the `guard` each
route declares in `src/lib/routing/routes.ts`: a signed-out visitor to a
volunteer route is redirected to `/{locale}/login?next=…`, a signed-in visitor
to an auth route is redirected to the dashboard, and signed-in responses carry
`Cache-Control: private, no-store`. `(volunteer)/layout.tsx` checks the session
again as defence in depth. `next` is filtered through `safeReturnPath`, which
rejects anything that could leave this origin.

A token past its expiry is the end of the session: the proxy clears the cookie
and redirects to `/{locale}/login?next=…`, and `authed()` does the same through
`/api/auth/session/expired` when the backend answers `unauthenticated` — which
it also does for a session revoked by signing out elsewhere. Nothing is
rotated and nothing is retried, so there is no race to lose and no way to be
signed out early.

The exception is a cookie written before this change, which still carries a
refresh token. The proxy spends it once, on a document navigation, for a
full-length session token and stores no replacement (`isLegacySession` and
`upgradeLegacySession`). That is the only remaining caller of
`POST /auth/refresh`, and it exists so the switch to one token did not sign
out everyone at once. Once those cookies have aged out, it and `refresh.ts`
can go.

Sign-out is a Server Action, not a link, so it cannot be triggered by a
prefetch or a cross-site request. It calls `POST /auth/logout` with the session
token, which revokes that session at the backend so the token stops working at
once rather than staying valid for the rest of its three days; then it clears
the cookie, then redirects — and works without JavaScript.

Google's handoff is the same shape with one difference. `/api/auth/google/start`
asks `v-backend` for a browser-bound challenge, keeps its `state` in
`volontyorlar_google_state` and sends the nonce to Google inside the
authorization URL; Google answers with a **cross-site form post** to
`/api/auth/google/callback`, which a `SameSite=Lax` cookie would not survive, so
the three Google handoff cookies are set `SameSite=None; Secure` for their 15
minutes, and they expire in ten to match the backend's own challenge window.
`Secure` is unconditional there, which browsers still honour on
`http://localhost` and nowhere else on plain HTTP. The callback also refuses a
post whose `Origin` is neither `https://accounts.google.com` nor this host, so
the only cross-site poster it accepts is Google itself. The callback signs in only
when the posted `state` equals that cookie, the backend consumes the challenge
once and checks the ID token's signature, issuer, audience and its own stored
nonce, and a refusal lands on `/login?google=…` with no session. The token
arrives in a request body and is read by a route handler; it never reaches
JavaScript, a query string or storage.

Three short-lived `httpOnly` cookies carry the handoff into Telegram:
`volontyorlar_auth_state`, `volontyorlar_return_to` and
`volontyorlar_auth_locale`, all 15 minutes, all deleted on return. The callback
signs in only when the `state` Telegram echoes equals the one in this
browser's cookie, and the backend consumes that state once, so a callback URL
opened in another browser, or a second time, lands on `/login?telegram=expired`
without a session. Telegram's own `error=access_denied` becomes
`?telegram=cancelled`, and a sign-in without a shared phone number
`?telegram=phoneRequired`.

### Joining a second account

A signed-in volunteer connecting a second identity never touches the sign-in
cookies. The handoff is carried by `volontyorlar_connect_state`,
`volontyorlar_connect_google_state` and `volontyorlar_connect_locale`, three
`httpOnly` cookies of their own: the Telegram pair is `SameSite=Lax` like the
sign-in handoff, and the Google pair is `SameSite=None; Secure` because Google
posts its ID token cross-site to `/api/auth/connect/google/callback`. Both
callbacks refuse to call the backend until the returned `state` equals the
cookie this browser holds, and both clear the cookies on the way out, so a
replayed callback is refused.

A completion returns to `/{locale}/settings?connect=<status>` where the status
is one of eleven words the catalog translates. No email address, account id,
provider name, merge-request id, token or provider state ever reaches a query
string, a Client Component, browser storage or a log line; the page reads the
outcome by fetching `/me` and the pending requests again on the server.

Approving a merge is one of two places a Server Action replaces the session: the
backend returns the canonical account's session inside the approval, the action
parses it with the same schema sign-in uses and writes the same encrypted
`httpOnly` cookie. When the backend answers `recentAuthenticationRequired`
instead, `/api/auth/connect/reauthenticate` ends the session on the backend,
clears the cookie and returns the browser to sign-in with a same-origin
`next=/{locale}/settings`.

Setting or changing a password also replaces the encrypted session. The
backend decides from the authenticated account whether the current password is
required, hashes the new password, revokes the lineage's existing refresh
sessions and returns one replacement session. The browser never receives a
password hash, and plaintext passwords stay inside the form POST and the
server-to-server API request.

The only stored values remain the light/dark theme choice and the interface
language, both in readable cookies shared with the marketing site so a choice
made on either origin holds on the other, and the welcome flow's progress
(`volontyorlar_onboarding`): a status and a step name such as `pending:about`
or `done`, app-only, ninety days, written by the sign-up action or an OAuth
callback for a new account and advanced by the browser as the volunteer moves
through the steps. None identifies a visitor, none is `httpOnly` because the
theme is applied by a script before paint and the flow updates its own
progress, and the privacy page names the first two. The answers given in the
flow are saved to the backend at each step and never enter browser storage.
Nothing personal appears in a URL;
sign-in carries only `?telegram=expired|unavailable`, `?session=expired` and a
same-origin `?next=` path checked by `safeReturnPath`, and the account page only
`?connect=<status>` or `?password=set|changed`.

Outbound links to the marketing site open with `rel="noopener noreferrer"`.
The portfolio links a volunteer puts on their own profile are untrusted input:
`src/lib/profile/links.ts` renders one only when it parses as `http:` or
`https:`, drops anything else rather than guessing, shows the host instead of
the raw string, and the anchor carries `rel="noopener noreferrer nofollow"`.

## Not implemented

- password reset and email verification
- notification, privacy and appearance preference controls; no screen offers
  these switches
- unlinking, unmerging, export and account deletion; `/settings` connects and
  merges only
- "sign out everywhere"
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
- Cookie behaviour when the sign-in is started from inside Telegram's in-app
  browser on the real production origin
- HTTPS behaviour and HSTS preload eligibility on the production origin
