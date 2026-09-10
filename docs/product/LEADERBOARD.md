# The Leaderboard and the Handle

Where a volunteer sees the whole community ordered by experience, and the name
they are ordered under.

## What the volunteer sees

`/leaderboard` is a session-protected section in the desktop sidebar, between
the record and the account list. It is deliberately **not** in the phone tab
bar: the tab bar keeps its four essential destinations (dashboard,
opportunities, applications, profile), and the leaderboard is reached from the
sidebar on a wide screen and by URL on a phone.

The page has three parts:

1. **Your standing** — two figures read straight from the response's `viewer`:
   the place and the experience, with the total volunteers as the place's note.
   Beneath them, the handle the volunteer appears under and a link to the
   account page, which is where a handle is changed.
2. **Standings** — one page of the board: place, handle with the display name
   under it, and experience. The first three places and the volunteer's own row
   are in orange, the colour that belongs to the person; every other experience
   figure is plain ink so the orange keeps meaning something. The reader's own
   row is on the soft surface, carries `aria-current`, and is marked with a
   chip.
3. **Pagination** — rendered from the response's own `page`, `pageSize` and
   `total`, never from a count of the rows on screen.

An account with no standing yet sees a short panel saying so instead of the
figures. A page number past the end redirects to the last page, so the
"showing 26–30 of 30" line never contradicts an empty table.

## Nothing is calculated here

**The frontend never computes experience or a rank.** Both arrive on every
entry and on `viewer`; the page renders them. This is the same rule the record
follows for levels in reverse: a level is derived in one place on the frontend
because the thresholds are ours, while experience and rank are the backend's
and are only displayed. → `src/lib/api/schemas.ts`

The one thing the frontend does compute is which page is which — page count,
the clamped current page, the window of page numbers, and the "showing
first–last of total" range. → `src/lib/leaderboard/pagination.ts`

Marking the reader's own row is identity matching, not ranking: the row's
`username` is compared with `viewer.username`.

## The handle

Every account has a `username`: lowercase letters, digits and underscores, 5 to
32 characters, unique across the service. It is the only name shown on the
board, so it is public to every signed-in volunteer, and it has a `source`:

| Source      | Where it came from                                | Renameable |
| ----------- | ------------------------------------------------- | ---------- |
| `generated` | invented by the backend when the account was made | yes        |
| `custom`    | chosen by the volunteer                           | yes        |
| `telegram`  | imported from the connected Telegram account      | no         |

A Telegram-managed handle is read-only in the interface: it is shown with a
lock and a sentence saying it comes from Telegram and changes with it. No
disabled input, no button that looks live and does nothing.

A generated or custom handle can be renamed in two places, both the same
component:

- **the account page** (`/settings`), in its own panel under the connections;
- **the end of the welcome flow**, on the "your pass is ready" step, where a
  new account is told the handle was invented for it and can choose its own
  before leaving.

Placement and treatment are frontend decisions; what a source means is not.

## The contract

Read: `GET /leaderboard?page&pageSize` → `{ items, page, pageSize, total,
viewer }`. Write: `PUT /me/username` with `{ username }`. The handle and its
source also arrive on `GET /me`.

Both are parsed by `src/lib/api/schemas.ts` and read through
`src/lib/api/leaderboard.server.ts` and `src/lib/api/account.server.ts`. The
rename is a Server Action in `src/lib/account/actions.ts` returning the usual
`ActionResult`; its backend codes are `usernameUnavailable`,
`usernameManagedByTelegram` and `usernameInvalid`, translated in all three
catalogs under `settings.errors`, alongside the four field messages the shared
Zod rules produce.

The frontend rules mirror the backend's own constraint rather than inventing
one — see
[`../../.agent-memory/decisions/leaderboard-contract-is-built-blind.md`](../../.agent-memory/decisions/leaderboard-contract-is-built-blind.md)
for what was known when this was written and what must be re-checked once the
backend publishes the two routes.

## Degrading honestly

While a deployment has not shipped the handle, `/me` carries no `username`,
`usernameIdentity()` answers `null`, and the account page simply has no handle
panel and the welcome flow no handle card. Nothing invents a name. The
leaderboard section is still registered and still reachable; until the backend
serves `/leaderboard` the section renders the panel's load error with a retry,
like any other section whose read fails.
