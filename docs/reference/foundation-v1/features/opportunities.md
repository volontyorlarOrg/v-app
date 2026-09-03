# Opportunities

The product's front door, and the only indexable surface.

**Code:** [`features/opportunities/`](../../src/features/opportunities/) ·
[`components/opportunities/`](../../src/components/opportunities/) ·
[`app/[locale]/(public)/opportunities/`](<../../src/app/%5Blocale%5D/(public)/opportunities/>)

---

## Why this page gets special treatment

Most volunteers arrive from a Telegram link, on a phone, on a connection that
is not fast. So:

- the list and detail pages are Server Components with **no client JavaScript**
  for the content itself — only the filter bar is interactive
- the whole card is one link: one tap target, one tab stop per result
- filters live in the URL, so a shared link reproduces what the sender saw
- the detail page is readable before hydration

## Filters

`q`, `region`, `format`, `open`, `sort`, `page` — the complete whitelist, and an
E2E test asserts nothing else ever appears in a URL.

Parsing never throws. A truncated or hand-edited link from a chat app is normal
input: unknown values are dropped and the closest sane listing renders.
Defaults are omitted when serialising, so one listing has one canonical URL.

Changing any filter resets to page 1. Without that, narrowing a search while on
page 4 lands on an empty page that reads as "no results".

The search box keeps a local value for responsiveness and pushes to the URL on
a 350ms debounce. It re-syncs from the URL during render — not in an effect —
when the URL changes from elsewhere (Back, a pasted link, "clear filters").

## Status and deadlines

Both are **derived**, in [`deadline.ts`](../../src/features/opportunities/deadline.ts):

- Days are calendar days in `Asia/Tashkent`, not 24-hour spans and not in the
  server's local zone. A deadline at 23:00 tonight is "today" wherever the
  process runs. See [`lib/datetime.ts`](../../src/lib/datetime.ts) — this was a
  real bug, caught by a unit test.
- "Closing soon" is within three days.
- An `open` opportunity whose deadline has passed displays as **closed**.
- Whatever the sort, applicable opportunities precede inapplicable ones.

## Empty, loading, and error

- **Empty:** offers to clear the filters.
- **Loading:** `loading.tsx` streams a skeleton grid shaped like the real one.
- **Error:** the listing's own error state, distinguishing "not configured"
  from a genuine failure. The header, filters, and language switcher keep
  working — a failed fetch is a page state, not a crashed route.
- **Missing opportunity:** its own message, not a generic 404.

## Not implemented

Cursor pagination (offset is enough at current volume); a category taxonomy
(the backend has none, and inventing one would be fiction); saved-search
alerts; a map view.
