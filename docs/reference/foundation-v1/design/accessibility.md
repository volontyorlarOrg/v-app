# Accessibility

Requirements, and where each is enforced so it cannot quietly regress.

---

## Structural, not remembered

| Requirement                            | Enforced by                                                       |
| -------------------------------------- | ----------------------------------------------------------------- |
| Label association                      | [`Field`](../../src/components/ui/field.tsx) — `useId`, `htmlFor` |
| `aria-describedby` for help and errors | `Field`, error first                                              |
| `aria-invalid` when invalid            | `Field`                                                           |
| Errors announced                       | `role="alert"` in `Field`, `ErrorState`, `SaveIndicator`          |
| Visible focus                          | One global `:focus-visible` rule in `globals.css`                 |
| Reduced motion                         | Global media query in `globals.css`                               |
| Skip link                              | First focusable element in `AppShell`                             |
| Current page                           | `aria-current="page"` in `NavLink` / `TabLink`                    |
| Accessible dialogs                     | Radix — focus trap, Escape, scroll lock, `aria-modal`             |

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

Every pair the product actually paints is checked by `npm run check:contrast`,
and the design system explains the palette. The parts that matter here:

- **Body text** is `ink` (14.37:1) or `ink-muted` (6.24:1) on white. Both clear
  AA comfortably on `surface` and `surface-strong` too.
- **Brand blue and brand orange are graphics colours.** `#007FC2` is 4.36:1 and
  `#E85D30` is 3.48:1 — fine for the mark, icons, and headings at 24px+, and
  below the 4.5:1 floor for body text. Text and filled buttons use `blue-deep`
  (6.96:1) and `orange-deep` (5.41:1). A white label on brand blue fails AA;
  the contrast script asserts that it still fails, so nobody "simplifies" the
  palette back into the trap.
- **Form control borders** use `line-control` (3.70:1), because WCAG 1.4.11
  requires 3:1 for a meaningful UI boundary. The decorative `line` token
  (1.27:1) is for card edges and dividers only.
- **The focus ring** is `blue-deep`, 6.96:1 on white and 6.48:1 on `surface`.
- **Colour is never the only signal.** Blue and orange are 1.25:1 against each
  other, so a blue/orange distinction is invisible in greyscale. Every status
  carries an icon and a word.

## Tested

- **Component:** label association, describedby wiring, `aria-invalid`, alert
  roles, group semantics for checkbox sets, unique ids across instances.
- **E2E:** the skip link is the first tab stop; no horizontal scroll at 360px
  on either public page.

## Not yet done

No automated axe pass in CI. No screen-reader walkthrough with VoiceOver or
NVDA. Both are worth doing before launch; neither is a substitute for the
structural guarantees above.
