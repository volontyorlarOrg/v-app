# The account-connection contract, and the half of it OpenAPI still cannot carry

Checked on 9 September 2026 against `../v-backend`: the ten routes are
implemented and published — `/me/account-connections/{telegram/authorize,
telegram/complete,google/challenge,google/complete,password/verify}` and
`/me/account-merge-requests` with `:id`, `:id/approve`, `:id/reject`,
`:id/cancel` — and `docs/api/ACCOUNT_LINKING_FRONTEND_HANDOFF.md` is the
handoff that defines them.

`npm run api:types` therefore types the paths, the methods and the request
bodies (`BeginTelegramLoginDto`, `CompleteTelegramLoginDto`,
`CompleteGoogleLoginDto`, `VerifyPasswordConnectionDto`). It does **not** type a
single response: every `200` in the document is `{"description": ""}`, because
the Nest controllers return plain objects with no response DTO. So the response
half of the contract lives in `src/lib/api/schemas.ts` and is checked against
the handoff by hand:

- `authMethodsSchema` is three plain booleans, not objects. `/me` reports
  `{ telegram, google, password }` across the merged account lineage, and the
  Telegram handle still arrives separately in `telegramIdentity`.
- a merge request names the way in as `requestedVia`, not `provider`, and
  carries a `counterparty` of `{ displayName?, authMethods }` — the only thing
  the approving volunteer is told about the other account.
- the list is `{ incoming, outgoing }`, two arrays, not `{ items, total }`; the
  backend expires stale requests lazily and returns only pending, unexpired
  ones, so a request can vanish between a render and a click.
- `AccountMergeStatus` is `pending | processing | completed | rejected |
cancelled | expired`. Approval completes as `completed`, never `approved`.
- reject and cancel return `{ request }`, so `mergeResolutionSchema` parses
  them rather than accepting any acknowledgement.

Two tolerances keep the page honest against an older deployment: `meSchema`
fills `authMethods` from `telegramIdentity` when the field is absent, and
`listMergeRequests` reads a `notFound` as two empty lists. Neither invents a
connection that is not there. When the backend starts documenting response
bodies, re-run `npm run api:types` and check the two against each other rather
than assuming they still agree.
