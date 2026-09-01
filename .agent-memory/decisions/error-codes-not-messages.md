# Server actions return error codes, not sentences

The Dwelve reference returns user-facing English from `handleServerError`:
`"Invalid email or password."` It reads well and is a dead end for a
multilingual product — that string reaches a Russian speaker as English, and
there is no hook to translate it at.

Here `handleServerError` returns an **`ApiErrorCode`** from a closed set, which
is also a translation key under the `errors` namespace. The client renders
`t(\`errors.${code}.title\`)`.

Consequences worth knowing:

- Zod schemas carry **keys** as messages too (`"tooShort"`), resolved by
  `useValidationMessage`. A schema is a module and cannot call
  `useTranslations`.
- Anything thrown that is not an `ActionFailure` is logged server-side and
  masked as `server`, so backend internals cannot leak into a browser.
- Adding a failure mode means adding a code to `API_ERROR_CODES` **and** an
  entry to all three `errors.json` catalogues. The parity test enforces the
  second half.

The same reasoning is why the backend must never send a computed volunteer
level: a label decided server-side cannot be translated or explained here.
