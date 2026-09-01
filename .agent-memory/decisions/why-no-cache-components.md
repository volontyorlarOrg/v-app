# Cache Components / PPR is not enabled

Next.js 16 offers `cacheComponents`, which would let the opportunity detail
page have a static shell with the session-dependent call to action streamed in.
That is genuinely the right shape for this page — a public, cacheable article
with one personalised control.

Not enabled, for now, because:

1. It changes the caching semantics of every route at once, and this codebase
   has no production traffic to validate that against.
2. The win is small at current volume. The backend read is already cached by
   `revalidate` + tags, so the repeated cost of a dynamic render is a template
   render, not a network round trip.
3. There is no backend, so there is no real latency to measure the improvement
   against. Enabling a caching strategy you cannot measure is how caching bugs
   ship.

**Revisit when** there is real traffic and a real backend. The detail page is
the first candidate: wrap the CTA in `<Suspense>` and the shell becomes
prerenderable.

See [[generate-static-params-and-cookies]].
