# The stub backend remembers between runs

`e2e/stub-backend.mjs` keeps its state in memory, and the Playwright config
reuses an already-running stub outside CI. A second `npm run test:e2e` against
the same stub process therefore starts from the first run's state: the email
that "a Telegram-only account can add an email and set its first password"
registers is already taken, so the test fails with the success message never
appearing, and it fails again in isolation until the stub is restarted.

**How to apply:** restart the stub (or let Playwright start a fresh one on a
private port) before reading a red run as a regression. Seen 2026-09-11 while
verifying the panel rework on ports 3911/3912.
