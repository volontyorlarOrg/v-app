# `v-backend` has a schema, configuration and health routes — and no product endpoints

Checked in September 2026 against `../v-backend`:

- `prisma/schema.prisma` models `User` (roles `volunteer` / `partner` /
  `admin`), `TelegramIdentity`, `RefreshSession`, `AuthTicket`,
  `VolunteerProfile`, `Organization`, `Opportunity`, `ApplicationQuestion`,
  `Application`, `ApplicationAnswer`, `SavedOpportunity`, `SavedEssay`,
  `AttendanceRecord`, `AuditLog`, `OutboxEvent`. The enums match this
  repository's vocabulary: fourteen regions, `onsite` / `remote` / `hybrid`,
  `open` / `closed` / `full`, seven application statuses, four attendance
  outcomes.
- `src/modules/*` are empty module shells. Only `/`, `/health/live`,
  `/health/ready` and the Swagger routes respond.
- Authentication is designed as Telegram deep-link tickets plus JWT access
  and rotating refresh tokens, gated by `AUTH_ENABLED`. There is no email or
  Google identity model yet; the implementation plan proposes them.
- `docs/api/FRONTEND_CONTRACT.md` there lists the planned endpoints against the
  previous frontend's schemas, now archived here under
  `docs/reference/foundation-v1/legacy/src/features/*/schemas.ts`.

So the earlier discovery "there is no backend" is out of date, and the new
one is narrower: there is a backend to write against, and nothing to call.
