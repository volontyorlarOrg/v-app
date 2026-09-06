# Google sign-in is an ID-token redirect, not the Google script

Decided on 7 September 2026, when `v-backend` grew `POST /auth/google/challenge`
and `POST /auth/google/complete`, and the maintainer asked for a Google Cloud
Console client rather than a hosted SDK.

- The backend verifies a **credential**: an ID token, checked against Google's
  published keys, the issuer, the audience and a nonce it stored hashed when it
  minted the challenge. It never exchanges an authorization code, and no
  `GOOGLE_CLIENT_SECRET` exists on either side. Two client strategies produce
  that token: Google Identity Services in the browser, or the OpenID Connect
  redirect with `response_type=id_token`.
- The redirect was chosen. Google's own discovery document lists `id_token` in
  `response_types_supported` and `form_post` in `response_modes_supported`, so
  `/api/auth/google/start` sends the browser to
  `accounts.google.com/o/oauth2/v2/auth` and Google posts the token back to
  `/api/auth/google/callback`. No third-party script loads, the CSP needed no
  change, `form-action` stays `'self'`, and the token never touches JavaScript
  — the same properties the Telegram flow already had.
- Google Identity Services would have cost a script from `accounts.google.com`,
  four CSP allowances, and a button rendered inside Google's own iframe that
  cannot match the Telegram button beside it. It remains the fallback if One
  Tap is ever wanted.
- **A cross-site form post does not carry a `SameSite=Lax` cookie.** The three
  Google handoff cookies are therefore `SameSite=None; Secure` for their 15
  minutes. `Secure` is unconditional, which browsers honour on
  `http://localhost` and on no other plain-HTTP host, so development happens on
  `localhost` or over HTTPS. Dropping the state cookie instead was rejected: it
  is the only thing that stops a login-CSRF replay of someone else's token.
- The client id is `VOLONTYORLAR_GOOGLE_CLIENT_ID`, server-only despite being
  public, because only the start route reads it. A value that does not match
  Google's client-id pattern is treated as unset and the button is not
  rendered.
- The mark stays **monochrome**. Google's guidelines prefer the coloured "G",
  but the palette admits no third hue and `src/app/typography.test.ts` refuses
  a literal hex anywhere under `src/`; the coloured asset would need four new
  tokens in both themes. Revisit only if a Google brand review asks.
- The challenge response shape (`{ state, nonce, expiresAt }`) was inferred
  from the `GoogleAuthChallenge` model and the Telegram authorize response,
  because `AuthService` did not yet implement `beginGoogleLogin` when this was
  written. `googleChallengeSchema` is where to look if the backend answers
  something else.
