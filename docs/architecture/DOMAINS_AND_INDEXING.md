# Domains, Routes, and Indexing

The deliberate divergence from the Dwelve reference architecture.

---

## 1. Two repositories, one product

| | `volontyorlarOrg/v-web` | `volontyorlarOrg/v-app` (here) |
| --- | --- | --- |
| Role | Marketing site | The product |
| Auth | None | Session-based |
| Indexing | Fully public | **Per route** |
| Owns | Brand narrative, design system source, brand assets | Discovery, profiles, applications, records |

Brand assets and the token palette come *from* the marketing repository so the
two look like one product. Application functionality never goes back into it.

## 2. Why not a blanket noindex

The Dwelve reference stamps `X-Robots-Tag: noindex, nofollow` on every response
because its entire product is private. Copying that here would be a serious
mistake: YVC's opportunity pages are **the acquisition funnel**. They get
shared into Telegram channels, and they are the reason someone creates an
account at all. Hiding them from search would remove the product's cheapest
distribution channel.

So indexing is a per-route decision, with two rules that never bend:

1. Anything that renders a specific person's data is private and noindex.
2. Anything indexable must render identically for a signed-out visitor.

## 3. The table

Defined once in [`lib/routes/policy.ts`](../../src/lib/routes/policy.ts) and
enforced in three places that all read from it.

| Route | Public? | Indexable? |
| --- | --- | --- |
| `/[locale]/opportunities` | yes | **yes** |
| `/[locale]/opportunities/[slug]` | yes | **yes** |
| `/[locale]/login` | yes | no |
| `/[locale]/dashboard` | no | no |
| `/[locale]/profile` | no | no |
| `/[locale]/saved` | no | no |
| `/[locale]/applications`, `/applications/*` | no | no |
| `/[locale]/record` | no | no |
| `/[locale]/settings` | no | no |
| `/[locale]/partner/*` *(reserved)* | no | no |
| `/[locale]/admin/*` *(reserved)* | no | no |

**Closed by default.** `isIndexablePath` works from an allowlist, so a route
added without thinking about indexing stays private. A test asserts this for an
invented path.

## 4. Enforcement

| Mechanism | File | Covers |
| --- | --- | --- |
| `X-Robots-Tag` + `Cache-Control` per route | `src/proxy.ts` | Every response |
| `robots` metadata per route | each `page.tsx` / `layout.tsx` | The rendered `<head>` |
| `robots.txt` | `src/app/robots.ts` | Crawler instruction |
| `sitemap.xml` | `src/app/sitemap.ts` | Only public routes, by construction |

The root layout defaults to `robots: { index: false }`; public routes opt **in**
via their own metadata. Both layers exist because `robots.txt` alone still
leaves link-discovered private URLs indexed as bare stubs — the header is what
actually keeps them out.

Signed-in responses get the private treatment even on public routes, because
they render personalised state ("you have applied", the saved badge) that must
not be cached for anyone else.

## 5. Localised URLs

Every URL carries its locale: `/uz/…`, `/ru/…`, `/en/…`. `localePrefix` is
`"always"`.

The alternative — hiding the prefix for the default locale and resolving it
from a cookie — breaks the main acquisition path. An opportunity link pasted
into a Telegram channel would render in a different language for each reader,
and the same URL would be two different pages to a crawler. An explicit prefix
makes a shared link mean exactly one thing.

Public pages emit a `canonical` and `hreflang` alternates for all three
locales. The language switcher preserves both the path **and** the query
string, so switching language on a filtered listing does not discard the
filters.

## 6. Verification

`e2e/privacy-and-indexing.spec.ts` asserts, without a backend:

- every private path redirects a signed-out visitor to sign-in, preserving the
  destination
- every private path is `noindex` and `no-store`
- the listing and detail pages are indexable, canonical, and carry alternates
- `robots.txt` allows discovery and disallows the account area
- the sitemap contains no private path
- security headers are present and `x-powered-by` is not
- no session cookie or token is reachable from client JavaScript
- server-only environment variables are absent from the client bundle
- only whitelisted filter parameters ever appear in a URL

## 7. Open

- The production canonical host. `NEXT_PUBLIC_SITE_ORIGIN` is a placeholder.
- Whether a public volunteer share profile exists. It would be the first
  indexable page containing personal data and needs an explicit privacy design
  before any route is added.
- Whether public organisation pages ship. `/organizations` is already on the
  indexable allowlist in anticipation; no route implements it yet.
