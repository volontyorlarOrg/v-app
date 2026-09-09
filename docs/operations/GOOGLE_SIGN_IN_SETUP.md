# Google Sign-in Setup

What to create in Google Cloud Console, and what to put where, so
"Continue with Google" works. Fifteen minutes, once per environment.

## What the flow needs from Google

`v-app` sends the browser to Google's authorization endpoint and asks for one
thing: an **ID token**, posted straight back to this application.

```text
GET  /api/auth/google/start
  -> POST v-backend /auth/google/challenge          state + nonce, stored hashed
  -> 303 accounts.google.com/o/oauth2/v2/auth
         response_type=id_token  response_mode=form_post
         scope=openid email profile  state  nonce  prompt=select_account
Google -> POST /api/auth/google/callback            id_token + state
  -> state must equal the httpOnly cookie the start route set
  -> POST v-backend /auth/google/complete           { state, credential }
  -> v-backend verifies the signature against Google's published keys, the
     issuer, the audience and its own stored nonce, then issues a session
  -> 303 /{locale}/dashboard with the encrypted session cookie
```

Two consequences worth knowing before you start:

- **There is no Google client secret anywhere.** No code is exchanged, so
  neither this repository nor `v-backend` needs one. Only the public client id
  is configured, on both sides, and it must be the same value: the backend
  verifies the token's `aud` against it.
- **The token never touches JavaScript.** Google posts it to a route handler,
  and the browser only ever holds the encrypted `httpOnly` session cookie.

## 1. A project and its consent screen

1. Open [console.cloud.google.com](https://console.cloud.google.com/) with the
   account that should own the credential — an organisation account, not a
   personal one, so the project survives a handover.
2. Create a project (**Volontyorlar**) or select the existing one.
3. Go to **APIs & Services → OAuth consent screen** (newer consoles call it
   **Google Auth Platform → Branding**) and fill in:
   - **App name** — `Volontyorlar`. This is the name Google shows on the
     consent screen, so it must be the product name, not a project code.
   - **User support email** and **Developer contact information**.
   - **App logo** — optional; uploading one starts a brand review, so leave it
     out until the rest works.
   - **Authorized domains** — the registrable domain of the application origin
     (for example `example.org` for `https://app.example.org`). Localhost needs
     no entry.
4. **Audience**: choose **External**. While it is in **Testing** only the
   accounts listed under **Test users** can sign in, which is what you want
   before launch. **Publish app** when you are ready for everyone; `openid`,
   `email` and `profile` are non-sensitive scopes, so publishing needs no
   Google verification review.
5. **Data access / Scopes**: add `openid`, `.../auth/userinfo.email` and
   `.../auth/userinfo.profile`. Nothing else — the product collects the
   minimum, and every extra scope is one more thing a volunteer must consent to.

## 2. The OAuth client

**APIs & Services → Credentials → Create credentials → OAuth client ID.**

| Field                         | Value                                                                 |
| ----------------------------- | --------------------------------------------------------------------- |
| Application type              | **Web application**                                                   |
| Name                          | `Volontyorlar App` (internal label only)                              |
| Authorized JavaScript origins | Leave empty. No browser script talks to Google in this flow.          |
| Authorized redirect URIs      | One per environment, exactly as below — Google matches them literally |

```text
http://localhost:3001/api/auth/google/callback
https://<the application origin>/api/auth/google/callback
http://localhost:3001/api/auth/connect/google/callback
https://<the application origin>/api/auth/connect/google/callback
```

The second pair is the connection flow: a volunteer who is already signed in
joining a Google account to theirs from `/settings`. It is the same client id
and the same `form_post` exchange, but a different callback path, so Google
refuses it until the path is registered too.

Rules Google enforces on that list, each of which has cost someone an
afternoon:

- The match is **exact**: scheme, host, port and path. A trailing slash, `www.`
  or `127.0.0.1` instead of `localhost` is a different URI. Add every form you
  actually use.
- Everything except `http://localhost` must be **HTTPS**.
- Changes can take a few minutes to propagate.

Copy the **Client ID** — it ends in `.apps.googleusercontent.com`. Ignore the
client secret; this flow never uses it.

## 3. Configuration

`v-app` (`.env.local` in development, the host's environment in production):

```dotenv
VOLONTYORLAR_GOOGLE_CLIENT_ID=<client id>.apps.googleusercontent.com
```

`v-backend`, from its own `.env.example`:

```dotenv
AUTH_ENABLED=true
GOOGLE_AUTH_ENABLED=true
GOOGLE_CLIENT_ID=<the same client id>
AUTH_RATE_LIMIT_SECRET=<openssl rand -base64 32>
REDIS_URL=<a reachable Redis; rediss:// in production>
```

`AUTH_RATE_LIMIT_SECRET` is required whenever Google or password auth is on,
and the backend refuses to boot without it. Both Google routes take a Redis
rate-limit slot before they do anything else, so **Google sign-in cannot
complete without a reachable Redis**: an unreachable one answers
`503 authRateLimitUnavailable` and the app reports that sign-in is
unavailable. The `20260907000000_google_password_auth` migration must also be
applied, because the challenge is a row in `GoogleAuthChallenge`.

The client id must be identical on both sides. `v-app` treats a client id that does not
match `NNN-xxx.apps.googleusercontent.com` as unset and hides the button
rather than sending the browser somewhere that will fail.

`NEXT_PUBLIC_SITE_URL` decides the redirect URI in production: when it is set,
the start route builds `${NEXT_PUBLIC_SITE_URL}/api/auth/google/callback` and
the connection route `${NEXT_PUBLIC_SITE_URL}/api/auth/connect/google/callback`,
both of which must be registered above. When it is blank the origin of
the incoming request is used, which is what makes `localhost` work with no
extra configuration.

## 4. Check it

1. `npm run dev` in `v-app`, `npm run start:dev` in `v-backend`.
2. Open `http://localhost:3001/uz/login`. The Google button appears only when
   the client id is set; if it is missing, that variable is the reason.
3. Press it. Google asks which account to use (`prompt=select_account`, so it
   asks every time rather than silently reusing the last one).
4. You land on the dashboard. `/uz/login?google=…` instead means the flow was
   refused, and the words on the page say which of the five reasons it was:
   `cancelled`, `expired`, `disabled`, `tooMany`, or `unavailable`.

## 5. Two failure modes worth recognising

- **`redirect_uri_mismatch` on Google's own error page.** The URI in the
  address bar is not in the client's list. Compare them character by character.
- **Back at `/login?google=expired` immediately.** The state cookie did not
  come back with Google's POST. That cookie is set `SameSite=None; Secure`
  because Google's form post is cross-site; browsers accept `Secure` cookies on
  `http://localhost`, but not on any other plain-HTTP host. Develop on
  `localhost` or over HTTPS.
