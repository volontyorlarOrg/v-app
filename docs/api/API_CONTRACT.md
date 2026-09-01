# API Contract

**Status: PROPOSED. Nothing in this document has been verified against a
running service.**

## Why this file exists

There is no YVC backend. The marketing repository's own documentation records
this plainly — `docs/data/DATA_MODEL.md` marks every domain concept as
"Implemented here: No", and `docs/integrations/TELEGRAM.md` says of the
Telegram integration: "Implemented: Nothing."

The frontend still needs a shape to code against. So this document states what
the application asks for, in one place, with every item labelled. When a real
backend appears, this is the reconciliation list — and any mismatch surfaces as
an `invalidResponse` error at the request boundary rather than as `undefined`
somewhere deep inside a component, because every response is parsed by a Zod
schema before it is returned.

**Do not cite this document as evidence that an endpoint exists.**

## Configuration

| Variable | Scope | Purpose |
| --- | --- | --- |
| `YVC_API_BASE_URL` | server only | Origin for all backend traffic. No trailing slash. |
| `YVC_SESSION_SECRET` | server only | ≥32 chars; encrypts the session cookie. |
| `YVC_ENABLE_SAMPLE_DATA` | server only | `true` serves the built-in sample opportunities when no API origin is set. |
| `NEXT_PUBLIC_SITE_ORIGIN` | public | Canonical origin for metadata and the sitemap. |

Neither the API origin nor any token is ever exposed to the browser; an
end-to-end test asserts their absence from the client bundle.

## Transport conventions the frontend assumes

1. JSON request and response bodies.
2. Authentication by `Authorization: Bearer <accessToken>`.
3. Conventional status codes: 401 unauthenticated, 403 forbidden, 404 missing,
   409 conflict, 422 (or 400) validation, 429 rate limited.
4. Validation failures carry field-level detail as `{ errors: { field: "msg" } }`
   or `{ errors: { field: ["msg"] } }`. NestJS's `{ message: [...] }` is
   tolerated but yields no field mapping.
5. `X-Request-Id` is sent on every request and is expected in the service log.
6. Timestamps are ISO 8601 with an offset.
7. Ownership is derived from the token. The frontend never sends a `userId`,
   and the backend must never accept one from a body.

Implementation: [`src/lib/api/client.server.ts`](../../src/lib/api/client.server.ts),
error taxonomy in [`src/lib/api/errors.ts`](../../src/lib/api/errors.ts).

## Endpoints

### Public — opportunities

| Method | Path | Response schema |
| --- | --- | --- |
| GET | `/opportunities` | `opportunityListResponseSchema` |
| GET | `/opportunities/{slug}` | `opportunityDetailSchema` |

Query parameters: `q`, `region`, `format`, `status`, `sort`, `page`, `pageSize`.

**Required ordering behaviour:** whatever the `sort`, opportunities that can
still be applied to must precede those that cannot. Sorting purely by deadline
ascending puts already-closed listings at the top of "closing soonest", which
is the least useful content in the most valuable position. The sample source
implements this; the backend must match.

Schemas: [`src/features/opportunities/schemas.ts`](../../src/features/opportunities/schemas.ts).

### Auth — Telegram (**assumed; see the caveat below**)

| Method | Path | Response |
| --- | --- | --- |
| POST | `/auth/telegram/ticket` | `{ ticket, botUsername }` |
| POST | `/auth/telegram/complete` | `{ userId, accessToken, refreshToken?, accessTokenExpiresAt?, displayName?, roles? }` |
| POST | `/auth/logout` | any |

The flow assumed is a bot deep link: the app asks for a single-use ticket,
sends the user to `t.me/<bot>?start=<ticket>`, the bot verifies the Telegram
identity server-side and delivers a one-time login link into the user's own
chat, and redeeming that link establishes the session.

**Why this shape and not the Login Widget:** a deep link can be forwarded. If
pressing Start signed in whichever browser minted the ticket, an attacker could
mint one, send it to someone else, and be signed in as them. Delivering the
credential through the chat means it reaches whoever actually controls the
account.

**Non-negotiable regardless of which flow is chosen:** the browser never
verifies a Telegram identity payload. Any `hash`, `auth_date`, or user object
that reaches JavaScript is untrusted. Verification uses the bot token, which
never leaves the backend.

Schemas: [`src/features/auth/telegram.ts`](../../src/features/auth/telegram.ts).

### Authenticated — profile

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/profile` | 404 means "not created yet" and is handled as an empty profile, not an error. |
| PUT | `/profile` | Body is `profileSchema`. |

### Authenticated — applications

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/applications` | Optional `status` filter. |
| GET | `/applications/{id}` | 404 and 403 are deliberately indistinguishable to the client, so the UI cannot be used to probe which ids exist. |
| GET | `/applications/by-opportunity?opportunityId=` | The volunteer's application to one opportunity. |
| POST | `/applications` | **Must be idempotent per (user, opportunity).** A double-tapped Apply button or a re-opened Telegram link must resume the existing draft, not create a second one. |
| PATCH | `/applications/{id}/draft` | Autosave. Called every few seconds while typing. |
| POST | `/applications/{id}/submit` | Answers become immutable. |
| POST | `/applications/{id}/withdraw` | |

**Application status enum — unconfirmed.** The frontend uses
`draft | submitted | under_review | accepted | rejected | withdrawn | closed`.
This is the handoff's suggested set, not a backend fact. It is defined once in
[`src/features/applications/schemas.ts`](../../src/features/applications/schemas.ts);
reconciling it is a single edit there plus the three translation catalogues.

### Authenticated — saved

| Method | Path |
| --- | --- |
| GET | `/saved` |
| POST | `/saved` |
| DELETE | `/saved/{opportunityId}` |

### Authenticated — record

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/record` | Raw counts only. The **level is derived on the frontend** so one formula exists; the backend must not send a computed level. |
| GET | `/record/history` | Participation entries with an attendance outcome. |

`recordCounts` must distinguish three things:

- `attended` — confirmed present.
- `acceptedResolved` — accepted *and* resolved by the organiser either way.
- `acceptedUnconfirmed` — accepted, event passed, organiser never said.

The third is excluded from reliability entirely. Collapsing it into
"accepted but not attended" would penalise volunteers for an organiser's
inaction, which the product forbids.

`standoutReviews` is a boolean the backend grants. The frontend never infers it.

## Open questions for the backend team

1. Is the Telegram flow above the one being built? If not, replace
   `src/features/auth/telegram.ts` before any of it is relied on.
2. What is the real application status enum?
3. Are hours scheduled, confirmed, or adjustable? The UI currently shows them
   as explicitly unverified because their meaning is undefined.
4. Who may confirm attendance, and can a confirmation be corrected?
5. What is the retention and deletion policy for essays and profiles? This has
   legal weight given a potentially minor audience.
6. Is there a partner permission model? Nothing partner-facing should be built
   until there is.
7. Will an OpenAPI document be published? If so, generate types from it and
   delete the handwritten schemas rather than maintaining both.
