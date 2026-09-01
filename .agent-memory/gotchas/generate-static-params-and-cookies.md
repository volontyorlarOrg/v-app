# `generateStaticParams` + `cookies()` = every request 500s

**Symptom.** The opportunity detail page returned 500 for every request in a
production build. The log said only:

```
digest: 'DYNAMIC_SERVER_USAGE'
```

The build itself succeeded and marked the route `● (SSG)`. Ten E2E tests failed
at once; the listing page was fine.

**Cause.** Exporting `generateStaticParams` marks a route static — *even when it
returns an empty array*. The page also called `getSession()`, which reads
`cookies()`. Reading a request-scoped API in a route Next is trying to
prerender throws `DYNAMIC_SERVER_USAGE`.

The empty array is what makes this confusing: it prerenders nothing, so it
looks like a no-op, but the marking still happens.

**Fix.** Remove the export. The route renders dynamically, which it must,
because its call to action depends on the session.

**Why this costs less than it looks.** The expensive part is the backend read,
and that is cached by `revalidate` + tags inside `getOpportunity`, so a burst
of visitors arriving from one Telegram link still shares a single upstream
fetch. The sitemap enumerates slugs separately.

**The general rule.** A route that reads `cookies()`, `headers()`, or
`draftMode()` cannot export `generateStaticParams`. If you want a static shell
*and* personalised content, that needs Cache Components / PPR, which this
project does not enable.

See [[why-no-cache-components]].
