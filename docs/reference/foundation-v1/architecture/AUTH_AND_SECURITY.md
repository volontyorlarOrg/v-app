# Authentication, Authorisation, and Privacy

**Related:** [`DOMAINS_AND_INDEXING.md`](./DOMAINS_AND_INDEXING.md) ·
[`../api/API_CONTRACT.md`](../api/API_CONTRACT.md)

---

## 1. The session

An **encrypted** JWE cookie, not a signed JWT.

A signed token leaves the backend access token readable by anyone who can see
the cookie value — a support screenshot, a shared device, a proxy log.
Encrypting it makes the cookie opaque to everything except this server.

| Property   | Value                                                    | Why                                                                                  |
| ---------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Name       | `yvc_session`                                            |                                                                                      |
| Encryption | `dir` + `A256GCM`, key = SHA-256 of `YVC_SESSION_SECRET` | Hashing gives exactly 32 bytes whatever the secret's shape                           |
| `httpOnly` | always                                                   | Puts the session out of reach of `document.cookie`, and therefore of any XSS payload |
| `secure`   | in production                                            |                                                                                      |
| `sameSite` | `lax`                                                    | Still rides the top-level navigation Telegram sends users back on                    |
| Lifetime   | 30 days                                                  |                                                                                      |

Implementation: [`lib/auth/session.server.ts`](../../src/lib/auth/session.server.ts).

**Nothing is stored in `localStorage` or `sessionStorage`.** An end-to-end test
asserts this.

### Failure is uniform

Tampering, expiry, a rotated secret, and a payload that no longer matches the
schema all produce the same result: `null`. Callers must not be able to tell
them apart, and none of them should lead to anything other than signing in
again.

### Where the session may be written

Only in a **Server Action or a Route Handler**. Next.js forbids cookie writes
during a Server Component render, and that restriction is load-bearing: a
render that could rotate tokens would spend a single-use refresh token it has
no way to persist, ending the session permanently.

## 2. Reading identity

```ts
const session = await requireSession(); // throws ApiError("unauthenticated")
const session = await getSession(); // null when signed out
```

This is the **only** source of authenticated identity.

A `userId`, `volunteerId`, or organisation role that arrived in a form field, a
query parameter, or a request body is user-controlled input. It must never
decide whose data is read or written. The request layer enforces this
structurally — no function in any `*.api.server.ts` accepts a `userId`.

What reaches the client is `PublicSession`, built by `toPublicSession`. Tokens
are absent by construction rather than by remembering to strip them.

## 3. Three layers, one of which is real

| Layer                    | What it does                                           | Is it security?                                          |
| ------------------------ | ------------------------------------------------------ | -------------------------------------------------------- |
| `src/proxy.ts`           | Redirects signed-out visitors away from private routes | **No.** A redirect for humans.                           |
| `(volunteer)/layout.tsx` | Re-checks the session                                  | **No.** Defence in depth against a proxy matcher change. |
| Backend                  | Authorises every operation                             | **Yes.**                                                 |

Hidden buttons are not authorisation. Frontend role checks decide what is worth
rendering, nothing more.

Server Actions are POSTs to the route they live on and are reachable by direct
request, which is why `authedActionClient` re-resolves the session in
middleware rather than trusting that the proxy already ran.

## 4. Roles

`volunteer`, `partner`, `admin`.

`coordinator` is deliberately **absent**. Regional coordinators exist
operationally — 500+ people applied for those roles — but no product workflow
and no backend contract does. Adding an authorisation level now would be
fiction, and fiction in an authorisation model is the expensive kind.

## 5. Telegram — assumed, not verified

The whole contract is marked unverified in
[`features/auth/telegram.ts`](../../src/features/auth/telegram.ts) and
[`../api/API_CONTRACT.md`](../api/API_CONTRACT.md). The marketing repository
records that nothing is implemented server-side.

What is implemented here is the _shape_: a start route that asks the backend
for a single-use ticket and redirects to the bot, and a complete route that
redeems a login token and writes the session.

### The property that must survive any redesign

**The browser never verifies a Telegram identity payload.** Any `hash`,
`auth_date`, or user object that reaches JavaScript is untrusted. Verification
uses the bot token, server-side.

### Why the login page does not poll

A deep link can be forwarded. If pressing Start signed in whichever browser
minted the ticket, an attacker could mint one, send their link to someone else,
and be signed in as them. Delivering the credential into the user's own
Telegram chat means it reaches whoever actually controls the account — so the
user finishes in the tab Telegram opens, and the starting tab never completes
on its own.

### Sign-out ordering

Tell the backend first, then drop the cookie. Reversing it leaves a live
refresh token in circulation that this app can no longer revoke, because it
just deleted the only copy. A backend failure does not block the local
sign-out: someone who pressed "sign out" must end up signed out on this device
regardless.

## 6. Open redirect protection

`safeReturnPath` accepts only a same-site path. It rejects anything not
starting with `/`, anything starting with `//` (protocol-relative, so
`//evil.example` is an absolute URL), and anything containing a backslash. It
is applied on the way in _and_ on the way back.

## 7. Response headers

Set globally in `next.config.ts`: `X-Content-Type-Options: nosniff`,
`X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`,
a restrictive `Permissions-Policy`, and HSTS. `x-powered-by` is off.

Per route, `src/proxy.ts` adds `X-Robots-Tag` and, for anything private,
`Cache-Control: private, no-store`. The `no-store` matters beyond SEO: without
it an intermediary could serve one volunteer's dashboard to another.

**Not yet configured: a Content-Security-Policy.** It needs a nonce-based
setup in the proxy and a known list of external origins, which depends on the
final analytics and error-reporting choices. Tracked below.

## 8. Youth-safety engineering

Volunteers are young people, potentially including minors.

- **Minimum collection.** The profile has no date of birth, address, document
  number, or parent contact. None has a stated product use, and collecting for
  later is what the rule forbids.
- **No PII in URLs.** Only the six declared filter parameters ever appear; an
  end-to-end test asserts the whitelist.
- **No essays or contact details in logs.** The API client logs code, status,
  path, and request id — never a body.
- **No sensitive data in browser storage.** Including essay drafts.
- **Private pages are never indexable or shared-cacheable.**

### Unresolved, and needing a policy decision

1. Retention and deletion for profiles, essays, and withdrawn applications.
2. Whether minors need guardian consent, and how that would be recorded.
3. Exactly what a partner may see of a volunteer's profile.
4. Whether a public share profile exists, and what it exposes.
5. CSP.
6. Error reporting: if Sentry is adopted, it must scrub user content before
   any event is sent.

None of these should be answered in code before product and legal answer them
in policy.
