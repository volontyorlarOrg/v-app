# The leaderboard contract is verified against the backend

Re-checked on 10 September 2026 against `../v-backend` after both routes were
implemented. The frontend parser now follows the backend response exactly.

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

The verified route contract is:

- `GET /leaderboard?page&pageSize` answers `{ items, viewer, page, pageSize,
total, scoring }`. Items are `{ rank, username, xp, isCurrentUser }` and the
  required viewer is `{ rank, username, xp }`. No display name or private ID is
  returned.
- `PUT /me/username` accepts `{ username }` and answers `{ username,
usernameSource, usernameEditable }`; that response is parsed before the
  action succeeds.
- `GET /me` requires the same three username fields.
- the mutation failure codes are `usernameUnavailable`,
  `usernameManagedByTelegram` and `validationFailed`.

The leaderboard schemas are strict so an accidental display name, ID or other
undocumented field fails closed. XP, ranks, viewer identity and editability are
all backend decisions and are not reconstructed in frontend code.
