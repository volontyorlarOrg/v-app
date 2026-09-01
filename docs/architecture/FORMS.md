# Forms

One shape for every form in the product.

```text
Zod schema  →  React Hook Form  →  Field components  →  next-safe-action
                                                            ↓
                              backend  →  revalidate / refresh  →  feedback
```

**Related:** [`ARCHITECTURE.md`](./ARCHITECTURE.md) ·
[`../design/accessibility.md`](../design/accessibility.md)

---

## 1. `next-safe-action` is the only mutation boundary

Anything a browser can trigger that changes state goes through
[`lib/safe-action.ts`](../../src/lib/safe-action.ts). Server Components may
call request functions directly for **reads**; never for writes.

Two clients:

- `actionClient` — unauthenticated.
- `authedActionClient` — resolves the session in middleware and exposes it as
  `ctx.session`.

`authedActionClient` is what makes "never trust an identity field from a form"
enforceable rather than aspirational: an action built on it *cannot* read a
`userId` from its input, because the only one available is
`ctx.session.userId`. The backend still authorises independently — a Server
Action is a POST to the route it lives on and is reachable without the UI.

## 2. Errors are codes, not sentences

The reference architecture returns `"Invalid email or password."` from the
server. That string cannot be shown to a Russian or Uzbek speaker.

Here, `handleServerError` returns an **`ApiErrorCode`**. The client renders
`t(\`errors.${code}.title\`)`. Anything thrown that is not an `ActionFailure`
is logged server-side and masked as `server`, so backend internals never reach
a browser.

```ts
const submit = useAction(submitApplicationAction, {
  onError({ error }) {
    const code = error.serverError ?? "server";
    toast.error(errors(`${code}.title`), { description: errors(`${code}.body`) });
  },
});
```

## 3. Validation messages are translation keys

A Zod schema is a module and cannot call `useTranslations`, so schemas carry
**keys** as their messages:

```ts
fullName: z.string().trim().min(2, { message: "tooShort" })
```

[`useValidationMessage`](../../src/lib/forms/use-validation-message.ts) turns
the key into a sentence at render time, interpolating the bound where one
applies. An unrecognised key falls back to a generic message — a volunteer
must never see `tooShort` on screen.

Keys live in `validation.json` in all three catalogues.

## 4. Zod `.default()` and the RHF generics

A schema with `.default()` has a different **input** type (field optional) from
its **output** type (field guaranteed). React Hook Form needs both:

```ts
useForm<ProfileFormValues, unknown, ProfileInput>({ resolver: zodResolver(profileSchema) })
//      ^ z.input           ^ context ^ z.output
```

Collapsing them into one generic makes the resolver types disagree in a way the
error message does not explain. `features/profile/schemas.ts` exports both
types for this reason.

## 5. `Field` is not optional

Every input goes through [`Field`](../../src/components/ui/field.tsx). It is
where accessibility is *structural* rather than remembered:

- label associated by `htmlFor`/`id` (a `useId`, so two fields cannot collide)
- `aria-describedby` wired to help text and errors, error first
- `aria-invalid` set whenever there is an error
- errors announced with `role="alert"`

Hand-rolling an input reliably loses one of these. `field.test.tsx` covers all
of them, which means it covers every form at once.

## 6. Requirements every form meets

- **Complete default values.** Every field, always — otherwise React switches a
  control from uncontrolled to controlled mid-typing.
- **Inline field errors**, translated.
- **A root error** for submission failures, separate from any field.
- **Disabled while pending**, with the label reflecting it.
- **`noValidate`** on the form, so validation is ours and is consistent across
  browsers and languages.
- **Explicit confirmation** where submission is irreversible.

## 7. Draft autosave

[`useAutosave`](../../src/features/applications/use-autosave.ts) saves after
1.5s of idle and reports status in words: "Saves automatically" → "Saving…" →
"Saved 14:32" → "Not saved".

Two decisions worth knowing:

**The server draft is the only durable copy.** Essay text is never written to
`localStorage`. It is exactly the sensitive personal content that must not sit
in browser storage without a documented need, and a server-side draft already
covers the case that matters — returning on another device, or after the tab
dies.

**`beforeunload` covers the remaining gap.** Between a keystroke and the next
successful save there is a window where a refresh loses work. Rather than
widen it silently, `hasUnsavedChanges` drives the browser's own "leave site?"
prompt.

Implementation note: `"pending"` is *derived* from "dirty and nothing in
flight" rather than stored. Storing it would mean a `setState` inside the
debounce effect, cascading a render on every keystroke — the React Compiler
lint rule flags exactly this.

## 8. Application answers are never pre-filled from another application

Reuse is an explicit per-field action the volunteer takes. Silently submitting
last month's essay to a different organiser is the failure this rule exists to
prevent. The submit schema is *generated* from the opportunity's questions, so
a question added server-side is validated without a frontend change — and a
character counter can never disagree with the rule that rejects the answer.
