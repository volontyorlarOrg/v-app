# Interaction and States

Every asynchronous surface needs four answers, not one.

---

## The four states

| State | Component | Rule |
| --- | --- | --- |
| Loading | `loading.tsx` + `Skeleton` in a `LoadingRegion` | Mirror the real layout so nothing jumps |
| Empty | `EmptyState` | Say why it is empty and offer the next action |
| Error | `ErrorState` / `ApiErrorState` | Name the *kind* of failure |
| Content | — | |

## Errors are never one message

"Something went wrong" is banned. The closed code set in
[`lib/api/errors.ts`](../../src/lib/api/errors.ts) has a distinct translated
title and body for each:

| Code | What the user is told |
| --- | --- |
| `unauthenticated` | Sign in, and we will bring you back |
| `forbidden` | You are signed in but not allowed here |
| `notFound` | The link may be old |
| `conflict` | You have already applied |
| `validation` | Some fields need attention |
| `network` / `timeout` | Check your connection — **nothing you typed is lost** |
| `server` | On our side; it has been logged |
| `notConfigured` | This part is not connected in this deployment |

Server components `catch` and render `<ApiErrorState error={error} />`. Client
components read the code from `error.serverError` and translate it.

**Never render `error.message`.** On the server it is the raw exception text
and can name internal hosts, queries, or configuration. The route boundary
shows the digest instead, which is the only safe handle and is what a server
log can be searched by.

## A failed fetch is a page state, not a crashed route

The opportunity listing catches its own error and still renders the header,
the filters, and the language switcher. Only a genuinely unexpected exception
reaches `error.tsx`.

## Destructive actions

Confirmation dialog, `danger` variant, and a description that says what will
happen — "the organiser will no longer consider you; you cannot undo this" —
not "are you sure?".

Applies to: submitting an application (irreversible answers) and withdrawing.

## Save feedback

Words, not icons alone: "Saves automatically" → "Saving…" → "Saved 14:32" →
"Not saved". A failed save is announced. The UI must never claim "Saved" when
it is not.

## Toasts

Sonner, top-centre, one system. For confirmation of an action the user just
took. Never for information they need to keep — that belongs on the page.

## Freshness

These workflows tolerate 30–60 seconds of staleness. No polling, no real-time
layer. `revalidatePath` after a mutation plus `router.refresh()` covers it.
