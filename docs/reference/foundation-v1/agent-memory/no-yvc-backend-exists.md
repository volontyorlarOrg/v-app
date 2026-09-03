# There is no YVC backend — confirmed from the marketing repository

Worth recording because it is the single fact that shapes most of this
codebase, and because it is easy to assume otherwise from how complete the
frontend looks.

`volontyorlarOrg/v-web` documents its own state plainly:

- `docs/data/DATA_MODEL.md` — a table of every domain concept with an
  "Implemented here" column reading **No** for all of them.
- `docs/integrations/TELEGRAM.md` — "**Implemented: Nothing.** The repository
  contains no Telegram bot token, widget script, OAuth callback, Login Widget
  configuration, Mini App SDK, bot username, webhook, deep link, or backend
  verification route."
- `docs/web/SEO_AND_ROUTES.md` — the only routes are `/`, `/v1`, `/v2`, `/v3`,
  which are design explorations.

The marketing repository _is_ real and useful: `DESIGN.md` carries the full
token set, `public/logo/` the brand assets, and `PRODUCT.md` the volunteer
level thresholds. Those were taken. The API was not, because there is none.

**What follows from this:**

- Every `*.api.server.ts` codes against a contract labelled _proposed_ in
  `docs/api/API_CONTRACT.md`.
- The Telegram flow in `features/auth/telegram.ts` is marked
  UNVERIFIED ASSUMED CONTRACT in its own header.
- Opportunity reads fall back to a flagged, visibly-labelled sample set.
- Signed-in E2E journeys are declared and **skipped with the blocker named**.

**Do not** quietly remove these labels because a page looks finished.
