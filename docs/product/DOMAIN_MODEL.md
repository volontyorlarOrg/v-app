# Domain Model

The concepts the frontend organises itself around. **None of these is a
database schema** — there is no backend. They describe what the UI needs and
where each rule is implemented.

---

## User

Global account identity. Comes from the session and nowhere else.

A user has one identity and, potentially, several roles. There is no global
"is an admin" bit in the frontend's reasoning: roles decide what is worth
rendering, and the backend decides what is permitted.

→ [`lib/auth/session.ts`](../../src/lib/auth/session.ts)

## VolunteerProfile

The reusable half of an application. Filled once, reused everywhere.

Fields: name, short bio, school, year/grade, region, city, languages, skills,
phone, Telegram username, links.

Every field earns its place by being needed for an application or for an
organiser to make contact. There is deliberately **no** date of birth, address,
document number, or parent contact — none has a stated product use, and the
audience includes minors.

**Completion** is defined explicitly, because a percentage with no stated rule
is exactly the unexplained number the product avoids. Six fields count:
`fullName`, `bio`, `region`, `school`, `languages`, and *either* contact
channel. "Complete" means an organiser can evaluate and contact you — which is
why a portfolio link, welcome as it is, does not count.

→ [`features/profile/schemas.ts`](../../src/features/profile/schemas.ts)

## Opportunity

The core marketplace object: title, summary, description, organisation, region,
city, format, start/end, application deadline, requirements, capacity, spots
remaining, status, questions, images, slug.

**Status is derived, not merely read.** The stored status says `open`; the
clock says the deadline passed. The clock wins — a listing that still claims to
be open three days after its deadline costs a volunteer an 800-word essay for
nothing.

`closingSoon` is not a stored status for the same reason: it is a function of
the deadline and the current time, so deriving it keeps one definition instead
of letting a stale server value disagree with the calendar.

→ [`features/opportunities/schemas.ts`](../../src/features/opportunities/schemas.ts),
[`deadline.ts`](../../src/features/opportunities/deadline.ts)

## Application

One volunteer's application to one opportunity.

States (**unconfirmed** — the handoff's suggested set, not a backend fact):
`draft`, `submitted`, `under_review`, `accepted`, `rejected`, `withdrawn`,
`closed`.

Three predicates rather than status comparisons scattered through components:
`isEditable` (draft only), `isWithdrawable` (submitted, under review, accepted),
`isTerminal` (rejected, withdrawn, closed).

Carries a **profile snapshot**, not a live reference. Referencing the current
profile would rewrite history: a volunteer who changes school in March would
appear to have applied in January with the new one. Reviewers need to see what
they were actually sent.

→ [`features/applications/schemas.ts`](../../src/features/applications/schemas.ts)

## ApplicationAnswer

An answer to one opportunity-specific question.

**Never carried over automatically.** Reuse is an explicit per-field action.
Silently submitting last month's essay to a different organiser is the failure
this rule exists to prevent.

The validation schema is *generated* from the opportunity's question list, so a
question added server-side is validated without a frontend change, and a
character counter can never disagree with the rule that rejects the answer. A
counter appears only when the backend states a `maxLength` — inventing a limit
would make someone trim a good answer to fit a number nobody set.

## SavedOpportunity

A bookmark. One toggle action carrying the intended end state rather than
separate add/remove actions, so a rapid double-tap cannot resolve out of order.

## VolunteerRecord

Derived from confirmed participation. Counts come from the backend; the level
is derived on the frontend so exactly one formula exists.

See [`../features/volunteer-record.md`](../features/volunteer-record.md) and
[`../../PRODUCT.md`](../../PRODUCT.md) for the thresholds.

→ [`features/record/levels.ts`](../../src/features/record/levels.ts)

## AttendanceRecord

Must distinguish four outcomes, and the fourth is the important one:

- `attended`
- `excused`
- `cancelled`
- `awaiting_confirmation` — accepted, the event has passed, the organiser never
  said

The fourth is **excluded from reliability entirely**. Folding it into "accepted
but did not attend" would penalise a volunteer for an organiser's inaction. The
UI states this on screen wherever unconfirmed events exist.

## Organization

Public identity of an organiser: name, slug, logo, and a `verified` flag that
YVC grants. Never inferred client-side. No organisation-facing routes exist
yet.

## Review / Rating

**Not modelled.** There is no review backend and no defined scoring rule. The
`standoutReviews` flag that gates the `core` level is a backend-granted boolean,
never a computation — which means `core` is currently unreachable, and that is
the correct behaviour. A level that is unavailable is better than one awarded
by a formula nobody agreed to.
