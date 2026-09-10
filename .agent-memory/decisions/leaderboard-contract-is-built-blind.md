# The leaderboard contract was written before the backend served it

Checked on 10 September 2026 against `../v-backend`: neither `GET /leaderboard`
nor `PUT /me/username` exists yet. `docs/api/openapi.json` has 80 paths and
none of them is either route, so `npm run api:types` types neither, and
`ApiPath` accepts both only through its `(string & {})` escape hatch. This
section was built to a contract the backend had not published.

What was **not** guessed: the backend's migration
`prisma/migrations/20260910000000_leaderboard_usernames/` was already on disk
uncommitted while this was written, and the frontend rules were copied from it
rather than invented.

- `username` is `text`, unique, and carries a `CHECK` that it equals its own
  lowercase and matches `^[a-z0-9_]{5,32}$`. `usernameField` in
  `src/lib/api/schemas.ts` and `usernameFormSchema` in
  `src/lib/account/username.ts` are that constraint, and `USERNAME_PATTERN`
  plus the two length constants are the single source both read.
- `UsernameSource` is the Postgres enum `generated | custom | telegram`, and
  the migration sets `telegram` for a handle imported from a
  `TelegramIdentity`. That is why a `telegram` handle is read-only here: the
  backend owns it and re-imports it.
- `xp` is a non-negative integer backfilled as
  `attended events × 50 + round(confirmed hours × 10)`. **That formula must
  never appear on the frontend.** It is recorded here only to explain why `xp`
  is parsed as `z.number().int().nonnegative()` and never recomputed.
- the board is indexed `(isActive, mergedIntoUserId, xp DESC, username ASC)`,
  which is the order the page renders and the reason ties are stable.

What **was** assumed, and is the first thing to re-check when the routes ship:

- the read is `GET /leaderboard?page&pageSize` answering
  `{ items: [{ rank, username, displayName?, xp }], page, pageSize, total,
viewer? }`, following `/opportunities`, the only other paged list, for the
  envelope. `viewer` is the addition: it is how the signed-in volunteer's place
  is shown while they are on another page.
- the write is `PUT /me/username` with `{ username }`. Its **response is not
  parsed at all** — `updateUsername` passes no schema — because the action
  revalidates and the page re-reads `/me`, which is authoritative. That is
  deliberate: a schema for an unknown body would be a guess, and an empty `204`
  would fail one.
- the failure codes are `usernameUnavailable` (taken),
  `usernameManagedByTelegram` (Telegram owns it) and `usernameInvalid`, plus
  the usual `validationFailed` with `errors.username`. They are listed in
  `ACCOUNT_ERROR_CODES` and translated in all three catalogs. A code outside
  that list already degrades to `errors.unknown` through `accountErrorKey`.

Both `username` and `usernameSource` are **optional** on `meSchema` on purpose:
a deployment without them is not an error, it is an account with no handle, and
`usernameIdentity()` answers `null` so the account page drops its panel and the
welcome flow drops its card. Nothing invents a name. The leaderboard entry's
`username`, by contrast, is required and strict — a board row without a handle
is a broken response, not a missing feature.

When the backend publishes the two routes, re-run `npm run api:types`, then
check this file against the generated paths and
`docs/api/FRONTEND_CONTRACT.md` rather than assuming they still agree. See
[`account-connections-are-a-forward-contract.md`](account-connections-are-a-forward-contract.md),
which is the same situation one feature earlier.
