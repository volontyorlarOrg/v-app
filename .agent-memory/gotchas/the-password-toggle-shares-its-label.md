# `getByLabel("Password")` matches the reveal button too

The password field's reveal control is a `button` with `aria-label="Show
password"`. Playwright's `getByLabel` matches accessible names by substring by
default, so `getByLabel("Password")` resolves to both the input and the button
and fails in strict mode.

Use `getByLabel("Password", { exact: true })` for the field. Testing Library's
`getByLabelText("Password")` is exact by default and does not have the problem,
which is why the component test never showed it.

Renaming the button would have been the wrong fix: "Show password" is the
label a screen-reader user needs.
