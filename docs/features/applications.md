# Applications

**Code:** [`features/applications/`](../../src/features/applications/) ·
[`components/applications/`](../../src/components/applications/)

**Related:** [`../architecture/FORMS.md`](../architecture/FORMS.md)

---

## Flow

```text
Opportunity detail → Apply → draft created (idempotent) → answer questions
  → autosave on idle → confirm → submit → status tracked
```

`POST /applications` **must be idempotent per (user, opportunity)**. A
double-tapped Apply button, a Back navigation, or a re-opened Telegram link all
land on the same route; creating a second draft each time would be a mess the
volunteer cannot clean up.

## States

`draft`, `submitted`, `under_review`, `accepted`, `rejected`, `withdrawn`,
`closed` — **unconfirmed**; the handoff's suggested set, not a backend fact.
Defined once, so reconciling is one edit plus the three catalogues.

Every state has an icon as well as a colour: `accepted` and `rejected` must be
distinguishable without colour vision, and this badge is often the only thing
scanned down a list.

Each state also has a one-line explanation of what it means _for the
volunteer_. `rejected` says "Not this time. Your record is unaffected." — which
is true, and worth saying.

## Validation

Generated from the opportunity's questions rather than hand-written, so a
question added server-side is validated without a frontend change and the
character counter cannot disagree with the rule that rejects the answer.

A counter appears **only** when the backend states a `maxLength`.

## Autosave

1.5s idle → save. Status shown in words: "Saves automatically" → "Saving…" →
"Saved 14:32" → "Not saved".

- The **server draft is the only durable copy**. Essays are never written to
  `localStorage` — that is sensitive personal content, and a server draft
  already covers returning on another device.
- `beforeunload` guards the window between a keystroke and the next successful
  save, so a loss is never silent.
- A failed save says "Not saved" with `role="alert"`. It must never claim
  "Saved" when it is not.
- Submitting flushes the pending save first, because an in-flight draft save
  can otherwise race the submit.

## Submission

Explicit confirmation, because answers become immutable. The dialog says what
happens: answers can no longer be edited, but the application can still be
withdrawn.

Withdrawal is separately confirmed and styled destructive.

## Not implemented

The saved-essay reuse picker (copy exists under `applications.reuse`; the
backend has no saved-answers endpoint); reviewer notes shown to volunteers
(needs a backend rule about what is visible); attachments (no upload contract).
