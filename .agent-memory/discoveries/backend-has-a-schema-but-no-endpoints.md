# `v-backend` serves every product endpoint the panel needs

Checked in September 2026 against `../v-backend` (`docs/api/openapi.json` and
`src/modules/*`):

- Public: `GET /opportunities` (query `q`, `region`, `format`, `status`,
  `sort=deadline|startDate|newest`, `page`, `pageSize` ≤ 50, `openOnly`) and
  `GET /opportunities/:slug`. Text is single-language; regions are kebab-case.
- Bearer-guarded: `/me`, `/me/preferences` (GET, PUT), `/profile` (GET — 404
  until first saved — and PUT), `/applications` (list, `by-opportunity`, get,
  POST start, PATCH `:id/draft`, POST `:id/submit`, POST `:id/withdraw`),
  `/saved` (GET, POST, DELETE `:opportunityId`), `/record`, `/record/history`,
  `/notifications` (GET, PATCH `:id/read`, POST `read-all`).
- Errors are `{ code, errors? }` bodies: `validationFailed` (422, field
  errors), `invalidAnswers` (400, `answers.<questionId>`), `profileRequired`,
  `opportunityUnavailable`, `applicationNotEditable`,
  `applicationCannotBeWithdrawn` (409), `*NotFound` (404).
- Authentication is Telegram deep-link tickets plus JWT access and rotating
  refresh tokens (`POST /auth/refresh` revokes the old token; a reuse is a
  409 `refreshTokenReused`). There is no email or Google identity model.

The earlier note "there is a backend to write against, and nothing to call" is
out of date: everything above is called from `src/lib/api/`.
