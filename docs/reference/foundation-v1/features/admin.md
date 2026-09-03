# Admin

**Status: not implemented, deliberately.**

---

## Why not

Same reason as [`partner-review.md`](./partner-review.md): no backend
authorisation model exists. Admin is where the destructive operations live, and
those are the last things that should be built against a guessed contract.

## What exists

`/admin/*` is reserved on the private, never-indexable allowlist, and `admin`
is a recognised role. Nothing is implemented.

## Scope when it is built

Opportunity creation and editing; partner and source management; application
oversight; attendance correction; reputation correction; content moderation;
regional operations later.

Admin is an **operational tool**, not a restyled volunteer UI. It optimises for
someone doing the same task forty times, which is a different design problem.

## Requirements that are not negotiable

1. Every mutation backend-authorised. A hidden route is not a permission.
2. Destructive actions confirmed, with the consequence stated in words, and
   styled with the `danger` variant.
3. Auditability wherever the backend supports it — especially attendance and
   reputation corrections, which change what a volunteer's record says about
   them.
4. A correction path for attendance. Organisers make mistakes, and the current
   model has no way to fix one.
