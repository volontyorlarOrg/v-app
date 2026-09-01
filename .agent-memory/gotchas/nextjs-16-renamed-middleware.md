# `middleware.ts` is `proxy.ts` in Next.js 16

The file convention was renamed. A file named `middleware.ts` is **silently
ignored** — no warning, no error, just no locale routing, no auth redirects, and
no indexing headers.

- File: `src/proxy.ts`, default export named `proxy`, same `config.matcher`.
- Types: `NextRequest` / `NextResponse` from `next/server`, or the `NextProxy`
  shorthand.
- The advanced flags were renamed too: `skipMiddlewareUrlNormalize` →
  `skipProxyUrlNormalize`.
- The runtime is Node.js and setting `runtime` in a proxy file throws.

`next-intl`'s export is still `next-intl/middleware`; that is a function, not a
file convention, and it composes inside `proxy.ts` normally.

**The thing to remember.** The proxy is not an authorisation boundary. Server
Actions are POSTs to the route they live on and a matcher change can silently
remove coverage — which is why `authedActionClient` re-resolves the session
itself. Next's own docs call this out.
