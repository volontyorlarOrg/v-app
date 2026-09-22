# The Leaderboard and the Handle

Where a volunteer sees the whole community ordered by experience, and the name
they are ordered under.

## What the volunteer sees

`/leaderboard` is a session-protected section: the third of the three in the
desktop sidebar, and the third of the four thumbs in the phone tab bar
(dashboard, opportunities, leaderboard, profile). It took the tab bar slot that
applications used to hold once applications became a tab inside the
opportunities section.

Beside the title, the page states the size of the whole community: the
response's `volunteerTotal`, every active volunteer, including those who have
not chosen a handle yet and so are not ranked. The board itself lists only
chosen handles, which is why its own count, `total`, can be smaller.

The page has three parts:

1. **Your standing** — two figures read straight from the response's `viewer`:
   the place and the experience, with the ranked total as the place's note.
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
entry and on `viewer`; the page renders them. The current volunteer level also
arrives from the backend with the record. The frontend retains the thresholds
only to explain progress toward the next level; it does not substitute a
locally calculated current level. → `src/lib/api/schemas.ts`

The one thing the frontend does compute is which page is which — page count,
the clamped current page, the window of page numbers, and the "showing
first–last of total" range. → `src/lib/leaderboard/pagination.ts`

The backend marks the reader's row with `isCurrentUser`; the frontend does not
infer identity from another field.

`volunteerTotal` is optional in the schema only so this app can ship before the
backend that adds it: until then the schema reads it as `total`, the headline
the page showed before. Make it required once every backend serves it.

## The handle

Every account has a `username`: lowercase letters, digits and underscores, 5 to
32 characters, unique across the service. The leaderboard also shows the
account's public `displayName`. Both are visible to every signed-in volunteer;
the display name is the primary label and the username has a `source`:

| Source      | Where it came from                                | Renameable |
| ----------- | ------------------------------------------------- | ---------- |
| `generated` | invented by the backend when the account was made | yes        |
| `custom`    | chosen by the volunteer                           | yes        |
| `telegram`  | synchronized from Telegram until a custom choice  | yes        |

A valid available Telegram handle seeds the username and follows later Telegram
changes. Choosing any username in Volontyorlar changes the source to `custom`
and permanently stops that synchronization. A provider collision never takes a
name from its current owner.

Every handle can be renamed in two places, both the same component:

- **the account page** (`/settings`), in its own panel under the connections;
- **the end of the welcome flow**, on the "your pass is ready" step, where a
  generated account must choose its own before leaving.

A generated handle is never offered back as a choice. The rename form starts
empty for a generated account, and the backend refuses the generated form —
`user_` and twenty hexadecimal characters — as `usernameReserved`, so the
welcome flow's gate opens only for a name the volunteer chose, and only chosen
names are ranked.

Placement and treatment are frontend decisions; what a source means is not.

## The contract

Read: `GET /leaderboard?page&pageSize` → `{ items, viewer, page, pageSize,
total, volunteerTotal, scoring }`. Each item is `{ rank, displayName, username, avatarUrl,
profileVisible, xp, isCurrentUser }`; the viewer carries the same public
identity fields without `isCurrentUser`. Generated usernames are excluded.
Rows link to `volontyorlar.uz/<username>` only while `profileVisible` is true.
Write: `PUT /me/username` with `{ username }` →
`{ username, usernameSource, usernameEditable }`. Those same username
fields are required on `GET /me`.

Both are parsed by `src/lib/api/schemas.ts` and read through
`src/lib/api/leaderboard.server.ts` and `src/lib/api/account.server.ts`. The
rename is a Server Action in `src/lib/account/actions.ts` returning the usual
`ActionResult`; its backend codes are `usernameUnavailable`,
`usernameReserved` and `validationFailed`, translated in all three
catalogs under `settings.errors`, alongside the four field messages the shared
Zod rules produce.

The frontend rules mirror the backend's own constraint rather than inventing
one — see
[`../../.agent-memory/decisions/leaderboard-contract-is-built-blind.md`](../../.agent-memory/decisions/leaderboard-contract-is-built-blind.md)
for the original assumptions and the verified replacement contract.
