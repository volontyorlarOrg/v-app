# Telegram sign-in is OpenID Connect, not the bot deep link

Decided on 5 September 2026, after the deep-link flow (ticket → `t.me/<bot>?start=` →
webhook → one-time link) failed in production and the product owner set the
behaviour they wanted: the volunteer is sent to Telegram, gives their phone
number, and comes back on the dashboard.

- Telegram's Login Widget now speaks OpenID Connect (`oauth.telegram.org`,
  discovery document at `/.well-known/openid-configuration`). Its sign-in
  page asks for the phone number and confirms in the Telegram app, which is
  exactly the requested experience; the `phone` scope returns the verified
  number as a claim, and `telegram:bot_access` lets the bot message the
  volunteer later without a `/start`.
- The deep-link flow depended on a webhook the bot had to answer. Its
  failure mode was silent: Telegram got `403` from a mismatched secret, the
  volunteer pressed Start and nothing happened. The OIDC flow has no inbound
  webhook, so there is nothing to register and nothing to drift.
- The backend owns the client secret, the code exchange and the ID token
  verification. This app only redirects, keeps the `state` in a cookie, and
  refuses a callback whose state is not the one this browser started. The
  backend consumes each state once.
- A sign-in without a shared phone number is refused (`403 phoneRequired`)
  rather than accepted with an empty phone, because the owner asked for the
  phone to be required. The profile receives the verified number and its
  `phoneVerified` flag is true only while the profile phone equals it.
- Local development cannot complete a real sign-in: Telegram redirects only to
  registered HTTPS URLs. The Playwright stub plays Telegram
  (`/oauth/auth` on the stub redirects straight back to the callback), and a
  local backend uses `DEVELOPMENT_AUTH_ENABLED`.
