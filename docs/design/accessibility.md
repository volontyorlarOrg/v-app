# Accessibility

Requirements, and where each is enforced so it cannot quietly regress.

---

## Structural, not remembered

| Requirement | Enforced by |
| --- | --- |
| Label association | [`Field`](../../src/components/ui/field.tsx) — `useId`, `htmlFor` |
| `aria-describedby` for help and errors | `Field`, error first |
| `aria-invalid` when invalid | `Field` |
| Errors announced | `role="alert"` in `Field`, `ErrorState`, `SaveIndicator` |
| Visible focus | One global `:focus-visible` rule in `globals.css` |
| Reduced motion | Global media query in `globals.css` |
| Skip link | First focusable element in `AppShell` |
| Current page | `aria-current="page"` in `NavLink` / `TabLink` |
| Accessible dialogs | Radix — focus trap, Escape, scroll lock, `aria-modal` |

`field.test.tsx` covers the whole contract, which means it covers every form in
the product at once.

## Rules with product reasons

**One `<h1>` per page**, via `PageHeader`. With many similar-looking pages, a
broken heading outline is the fastest way to make screen-reader navigation
useless.

**Status is never colour alone.** Every status badge carries an icon and a
word. `accepted` vs `rejected` and `open` vs `closed` must be distinguishable
in greyscale.

**Live regions where content changes without navigation:**
- result count after filtering — `role="status" aria-live="polite"`
- autosave state — polite, plus `role="alert"` on failure
- character counters — polite, so they do not interrupt typing
- loading regions — `role="status" aria-busy`

**Skeletons are `aria-hidden`.** A shimmering box tells a screen reader
nothing; the containing region announces the loading state once.

**Disabled pagination stays visible.** An `aria-disabled` span rather than a
removed link, so the boundary of the list is still perceivable.

**Zoom is not locked.** `maximumScale: 5`. Locking it is a WCAG failure and
this product is read on small phones by people who may need larger text.

**No custom drag-and-drop.** Nothing in the product needs it, and an
inaccessible one is worse than none.

## Contrast

The palette is high-contrast by construction: `ink` on `night` is far above
7:1, and `muted` on `night` clears 4.5:1. `teal-ink` on `teal` is the pairing
used for every primary button.

The one to watch is `muted` on `panel-strong`, the lightest surface. Prefer
`ink` for anything essential on that surface.

## Tested

- **Component:** label association, describedby wiring, `aria-invalid`, alert
  roles, group semantics for checkbox sets, unique ids across instances.
- **E2E:** the skip link is the first tab stop; no horizontal scroll at 360px
  on either public page.

## Not yet done

No automated axe pass in CI. No screen-reader walkthrough with VoiceOver or
NVDA. Both are worth doing before launch; neither is a substitute for the
structural guarantees above.
