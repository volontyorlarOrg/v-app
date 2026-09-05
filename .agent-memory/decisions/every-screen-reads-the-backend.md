# Every screen reads the backend; Telegram is the only way in

Decided in September 2026, once `v-backend` served every product endpoint the
panel needs and Telegram sign-in was live on both sides.

- The sample (`src/lib/sample/`) was deleted rather than gated. A screen that
  can render fiction is a screen that will ship fiction. Reads go through
  `src/lib/api/*.server.ts` and are parsed by Zod; a shape the schema rejects
  is an error, never a guess.
- The email/password forms and the reset page were removed rather than
  disabled. The backend has no password, so a form could only fake-succeed —
  the one behaviour the product owner ruled out. Google stays visible but
  `disabled` with a note, because it is planned and its absence is a
  configuration gap, not a design gap.
- `src/proxy.ts` guards every `(volunteer)` route unconditionally. An
  unconfigured deployment is closed, not a preview.
- Writes are plain Server Actions returning `ActionResult`; errors are backend
  codes the catalog translates. `next-safe-action` was not adopted.
- The palette still has no red; error states use the sunk surface and ink.
- The session cookie is `Secure` unless `NEXT_PUBLIC_SITE_URL` is explicitly
  `http:`, so a production build served over plain HTTP (the Playwright suite)
  keeps its cookie.
- When a refresh fails but the access token has not actually expired, the
  proxy keeps the cookie. Two tabs refreshing at once would otherwise sign the
  loser out; instead the winner's cookie reaches the browser and the next
  request uses it.
- `authed()` never asks the backend to rotate a refresh token unless the
  cookie can be written (a Server Action or route handler): the backend
  revokes the old token on rotation, so a rotation during a Server Component
  render would burn the session. The proxy rotates on navigations; a render
  that meets a 401 ends the session instead. `e2e/stub-backend.mjs` issues
  45-second access tokens — inside the 60-second refresh skew — so every
  Playwright request exercises those paths.
