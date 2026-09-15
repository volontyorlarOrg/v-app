# The Leaderboard and the Handle

Where a volunteer sees the whole community ordered by experience, and the name
they are ordered under.

## What the volunteer sees

`/leaderboard` is a session-protected section: the third of the three in the
desktop sidebar, and the third of the four thumbs in the phone tab bar
(dashboard, opportunities, leaderboard, profile). It took the tab bar slot that
applications used to hold once applications became a tab inside the
opportunities section.

The page has three parts:

1. **Your standing** — two figures read straight from the response's `viewer`:
   the place and the experience, with the total volunteers as the place's note.
   Beneath them, the handle the volunteer appears under and a link to the
   account page, which is where a handle is changed.
2. **Standings** — one page of the board: place, public display name, public
   handle and experience. The name is the primary identifier; the `@handle`
   sits beneath it in the smaller metadata role.
   The first three places and the volunteer's own row are in orange, the colour
   that belongs to the person; every other experience figure is plain ink so
   the orange keeps meaning something. The reader's own row is on the soft
   surface, carries `aria-current`, and is marked with a chip.
3. **Pagination** — rendered from the response's own `page`, `pageSize` and
   `total`, never from a count of the rows on screen.

A page number past the end redirects to the last page, so the "showing 26–30
of 30" line never contradicts an empty table.

## Nothing is calculated here

**The frontend never computes experience or a rank.** Both arrive on every
entry and on `viewer`; the page renders them. This is the same rule the record
follows for levels in reverse: a level is derived in one place on the frontend
because the thresholds are ours, while experience and rank are the backend's
and are only displayed. → `src/lib/api/schemas.ts`

The one thing the frontend does compute is which page is which — page count,
the clamped current page, the window of page numbers, and the "showing
first–last of total" range. → `src/lib/leaderboard/pagination.ts`

The backend marks the reader's row with `isCurrentUser`; the frontend does not
infer identity from another field.

## The handle

Every account has a `username`: lowercase letters, digits and underscores, 5 to
32 characters, unique across the service. The leaderboard also shows the
account's public `displayName`. Both are visible to every signed-in volunteer;
the display name is the primary label and the username has a `source`:

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

Read: `GET /leaderboard?page&pageSize` → `{ items, viewer, page, pageSize,
total, scoring }`. Each item is `{ rank, displayName, username, xp,
isCurrentUser }`; the viewer is `{ rank, displayName, username, xp }`. Write:
`PUT /me/username` with `{ username
}` → `{ username, usernameSource, usernameEditable }`. Those same username
fields are required on `GET /me`.

Both are parsed by `src/lib/api/schemas.ts` and read through
`src/lib/api/leaderboard.server.ts` and `src/lib/api/account.server.ts`. The
rename is a Server Action in `src/lib/account/actions.ts` returning the usual
`ActionResult`; its backend codes are `usernameUnavailable`,
`usernameManagedByTelegram` and `validationFailed`, translated in all three
catalogs under `settings.errors`, alongside the four field messages the shared
Zod rules produce.

The frontend rules mirror the backend's own constraint rather than inventing
one — see
[`../../.agent-memory/decisions/leaderboard-contract-is-built-blind.md`](../../.agent-memory/decisions/leaderboard-contract-is-built-blind.md)
for the original assumptions and the verified replacement contract.
