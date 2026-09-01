# Partner Review

**Status: not implemented, deliberately.**

---

## Why not

The handoff is explicit that partner and admin work comes only "after real
backend permissions/contracts exist". None do:

- no permission model defining what a partner may see of a volunteer
- no applicant-review endpoints
- no attendance-confirmation contract
- no organisation membership model

Building an applicant list against an invented contract would produce a screen
that looks finished, cannot be trusted, and would have to be rewritten once the
real rules appeared. The marketing repository also lists partner dashboards
under "explicitly deferred": organisations currently send details to the core
team, who post them.

## What exists

`/partner/*` is reserved on the **private, never-indexable** allowlist in
[`lib/routes/policy.ts`](../../src/lib/routes/policy.ts), and `partner` is a
recognised role. A policy test asserts `/partner/applicants` is never
indexable. No route file exists.

## What it will need

1. Opportunity access — which opportunities a partner may see applicants for.
2. Applicant list with filters.
3. A volunteer profile summary **bounded by what the partner is authorised to
   see**. This is a privacy decision, not a layout decision, and it must be
   answered before any field is rendered.
4. Track-record summary and application answers.
5. Accept / reject / review actions.
6. Attendance confirmation after the event — the input the whole record system
   depends on.

## Notes for whoever builds it

- `@tanstack/react-table` is **not installed**. Add it only if the applicant
  set genuinely benefits from a table; a card list is fine for twenty
  applicants and is far better on a tablet at an event.
- Mobile and tablet matter: organisers confirm attendance standing in a room,
  not at a desk.
- Every mutation must be backend-authorised. A partner reaching another
  organisation's applicants by changing an id in the URL is the failure mode to
  design against.
