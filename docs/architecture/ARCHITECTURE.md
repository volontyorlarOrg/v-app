# Request Architecture

How data gets from the backend into a page, and what happens when it does not.

**Related:** [`RENDERING_AND_STATE.md`](./RENDERING_AND_STATE.md) (who *owns*
which state) · [`../api/API_CONTRACT.md`](../api/API_CONTRACT.md) (what the
backend must provide) · [`FORMS.md`](./FORMS.md) (writes)

---

## 1. The one path

```text
Server Component / Server Action
        ↓
features/<domain>/api.server.ts      named request functions
        ↓
lib/api/client.server.ts             the only fetch to the backend
        ↓
Zod response schema                  backend JSON is untrusted until parsed
        ↓
typed value, or a thrown ApiError
```

Three rules make this hold:

1. **`client.server.ts` is imported only by `*.api.server.ts` modules.** No
   component, hook, or action calls it directly.
2. **`*.api.server.ts` modules start with `import "server-only"`.** Importing
   one from a client component is a build error, not a runtime surprise.
3. **No component knows the API origin.** It lives in one server-only
   environment variable, read through `lib/api/env.server.ts`.

## 2. What the client enforces

[`src/lib/api/client.server.ts`](../../src/lib/api/client.server.ts) is small
on purpose — it exists so that these are true everywhere rather than
per-call-site:

| Concern | How |
| --- | --- |
| Origin | `YVC_API_BASE_URL`, server only. Missing in production throws `notConfigured` rather than silently falling back to localhost. |
| Credentials | Attached in one place, by `authedApi`, from the session. Never by a caller. |
| Timeouts | 12s default via `AbortSignal.timeout`, composed with any caller signal. |
| Malformed bodies | A non-JSON body (an HTML 502, a proxy error page) becomes `null`, never a parse crash. |
| Response trust | Every UI-critical response is `safeParse`d. A 200 with the wrong shape is `invalidResponse`, not a silent `undefined`. |
| Errors | One `ApiError` with a code from a closed set. |
| Caching | Authenticated requests default to `no-store`. Public reads opt into `revalidate` + tags. |
| Logging | Code, status, path, request id. **Never a request or response body** — those contain essays and profile fields. |

## 3. The error taxonomy

One closed set, defined in [`src/lib/api/errors.ts`](../../src/lib/api/errors.ts):

```text
unauthenticated  forbidden  notFound  conflict  validation
rateLimited      network    timeout   server    notConfigured  invalidResponse
```

These are also translation keys under the `errors` namespace. That is the whole
point: a backend's English sentence cannot be shown to an Uzbek speaker, so the
server returns a *code* and the UI renders the translated message for it.

Two properties are derived rather than decided per call site:

- `isUserFacing` — false for `server`, `invalidResponse`, and `notConfigured`,
  which describe our infrastructure rather than the user's action.
- `isRetryable` — true only for `network`, `timeout`, `server`, `rateLimited`.
  TanStack Query reads this, so a 403 is never retried.

`classifyApiError` normalises anything thrown, including non-`Error` values and
the bare `TypeError` that `fetch` rejects with when offline.

### Rendering an error

Server components: `catch` and return
[`<ApiErrorState error={error} />`](../../src/components/shared/api-error-state.tsx),
which picks the right translated title and body for the code.

Client components: read `error.serverError` from a `next-safe-action` result —
it is a code — and translate it.

**Never** collapse everything into one message. A 403, a 404, a conflict, and a
dropped connection call for four different responses from the user.

## 4. Domain request modules

One per domain, beside the feature:

```text
src/features/opportunities/api.server.ts   public reads, sample fallback
src/features/applications/api.server.ts    authenticated reads and writes
src/features/profile/api.server.ts
src/features/saved/api.server.ts
src/features/record/api.server.ts
```

Conventions inside them:

- Authenticated functions call `requireSession()` first and pass the token
  explicitly. **No function takes a `userId`** — reading another volunteer's
  data is not a capability this layer offers, so it cannot be reached by
  passing the wrong id.
- "Not found" that is an ordinary product outcome returns `null`, so the caller
  can render a real page. Only genuine failures throw.
- `getMyApplication` maps both 404 and 403 to `null`, so the UI cannot be used
  to discover which application ids exist.

## 5. Caching

| Data | Policy | Why |
| --- | --- | --- |
| Opportunity list | `revalidate: 120`, tag `opportunities` | Identical for everyone; the hottest path in the product. |
| Opportunity detail | `revalidate: 300`, tags `opportunities`, `opportunity:<slug>` | A burst arriving from one Telegram link shares a single upstream fetch. |
| Anything authenticated | `no-store` | One volunteer's data must never be served from another's cached render. |

Opportunity *pages* render dynamically even though their *data* is cached,
because the detail page reads the session to choose its call to action. See the
note in
[`src/app/[locale]/(public)/opportunities/[slug]/page.tsx`](../../src/app/%5Blocale%5D/(public)/opportunities/%5Bslug%5D/page.tsx)
— adding `generateStaticParams` there makes every request fail with
`DYNAMIC_SERVER_USAGE`.

## 6. The sample data source

With no backend, opportunity reads fall back to
[`sample-data.ts`](../../src/features/opportunities/sample-data.ts) when
`YVC_ENABLE_SAMPLE_DATA=true` and no API origin is set.

Rules that keep this honest:

- Off by default.
- Every organisation in it is fictional. Real YVC partners are deliberately
  absent — attaching a fabricated event to a real organisation's name would
  misrepresent them.
- Whenever it is active the UI renders a visible sample-data notice, in the
  reader's language.
- Its filtering and sorting mirror what the backend is asked to do, so the two
  cannot drift into behaving differently under test.

Delete the file and the flag together once a real API exists.
