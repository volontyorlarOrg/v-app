# The language belongs to the app, not to the address

Decided on 2026-10-13 and 2026-10-14, at the product owner's request.

## Not in the address

Until then every address carried its language (`/uz/settings`,
`/en/settings`, `localePrefix: "always"`), a pattern copied from the marketing
site where a crawler needs one URL per language. Inside the app it made the
language behave like a place: changing it on `/settings` navigated from
`/uz/settings` to `/en/settings`, so pressing Back returned to the Uzbek
address and the middleware then rewrote the stored choice to match. A setting
the volunteer had just changed was undone by leaving the page.

Nothing in the app is indexed, so nothing needs a language in its URL:

- `src/i18n/routing.ts` sets `localePrefix: "never"`. `next-intl` rewrites
  `/dashboard` to the `[locale]` segment internally. The `[locale]` folder
  stays; only the visible address lost it.
- A language control calls `useLocaleSwitch()`: it saves the choice and calls
  `router.refresh()`. The address does not change, the router's cache is
  dropped, and Back and Forward re-read every entry in the new language.
- `src/proxy.ts` redirects an address that still starts with `/uz`, `/ru` or
  `/en` to the plain one, so old bookmarks, the marketing site's links and
  the bot's links keep working. It adopts that language **only when the app
  has none saved**; otherwise an old link would undo the setting exactly as
  Back used to. This is why the proxy strips the prefix itself instead of
  letting `next-intl` see it: `next-intl` would let the prefix win.
- Route handlers and Server Actions redirect to plain paths (`navHref`), so
  the `locale` hidden inputs, the `volontyorlar_auth_locale` and
  `volontyorlar_connect_locale` cookies and `localePath()` are gone. The
  `?locale=` parameter on the four start routes stays: it tells Telegram and
  Google which language to show their own page in.

## Not shared with the marketing site

The first version kept the language in `NEXT_LOCALE`, the cookie the app
shared with the marketing site since September. That cookie is not a choice:
the marketing site's middleware rewrites it from its own address on every page
load (measured: `GET /en` with `NEXT_LOCALE=ru` answers
`Set-Cookie: NEXT_LOCALE=en`), so going Back from the app into a marketing
page changed the app's language. On `localhost` the three portals did the
same, because cookies ignore the port. The product owner asked for the
language to live in the browser's local storage instead.

- The record is `localStorage["volontyorlar_locale"]`, which is per origin
  and per port, so nothing outside the app can touch it.
- The server cannot read `localStorage`, so the choice is mirrored to
  `volontyorlar_locale`, a host-only readable cookie (no `domain`, a locale
  code and nothing else) that `next-intl` reads as its `localeCookie`.
  `writeLocaleChoice()` in `src/lib/preferences.ts` writes both.
- `NEXT_LOCALE` is read exactly once: when the app has no saved language,
  the proxy seeds `volontyorlar_locale` from it, so existing volunteers and
  arrivals from the marketing site start in the language they were reading.
  After that the app never reads it again, and never writes it.
- The theme stays in the shared `theme` cookie; nothing about it changed.

## A page the browser kept is checked before it is shown

`router.refresh()` only empties the router's own cache. A page reached by a
full load (a typed address, a reload, a plain link) is a separate document,
and on Back the browser may show its stored copy without asking the server:
`next dev` sends `Cache-Control: no-cache, must-revalidate`, which Chromium
reuses for history navigation, and any browser may restore a page from its
back-forward cache. That copy is in the language it was rendered in.

`LanguageScript` in the root layout (`src/lib/language-guard.ts`) is an inline
script like the theme's. On load, and on `pageshow` when the page was
restored from memory, it:

1. restores the `volontyorlar_locale` cookie from `localStorage` if anything
   removed or replaced it;
2. compares `<html lang>` with that language and reloads once when they
   differ, before anything is painted.

A `sessionStorage` mark keeps a server that disagrees from causing a loop. A
production build sends `no-store` for every page, so there the reload mostly
follows a back-forward cache restore.

## The proxy can see its own rewrite again, and must let it through

`next-intl` rewrites `/login` to `http://localhost:<port>/uz/login`, because
Next.js normalises `127.0.0.1` to `localhost` in the URL a proxy reads. A
server started with `-H 127.0.0.1` — which is what `npm run dev` does —
compares that with its own `http://127.0.0.1:<port>`, decides the rewrite is
external and fetches it over HTTP, so the proxy runs a second time on
`/uz/login`. Treating that as an old link redirects to `/login` and loops
forever. The request header `next-intl` adds to its rewrite
(`x-next-intl-locale`) is what tells the two apart: a prefixed path carrying
the matching header skips the redirect, the username rules and `next-intl`,
keeps the guard, and continues. A server started without `-H` (Playwright's,
and Vercel) resolves the rewrite internally and never takes this path.
`src/proxy.test.ts` covers both, and the browser suite passes against either
kind of server. This is the same double pass the old
`_volontyorlar_app_profile` query marker existed for; the header replaced it.

`/<username>` is served by handing `next-intl` the request as
`/profiles/<username>`, so the member page and its not-found panel take the
reader's language from the same place as every other page.
