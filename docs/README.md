# YVC Product Application Documentation

This directory is the stable source of truth for the authenticated product.
Use this page as a **context router** — pick the row that matches your task and
read only that. Reading everything for every change is the failure mode this
index exists to prevent.

## Start by task

| Task                                                 | Read first                                                                               |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Product scope, roles, the volunteer loop             | [`../PRODUCT.md`](../PRODUCT.md), [`product/PRD.md`](./product/PRD.md)                   |
| Domain concepts and their ownership                  | [`product/DOMAIN_MODEL.md`](./product/DOMAIN_MODEL.md)                                   |
| Where a thing lives; route and folder structure      | [`architecture/SYSTEM_DESIGN.md`](./architecture/SYSTEM_DESIGN.md)                       |
| Calling the backend; schemas; error handling         | [`architecture/ARCHITECTURE.md`](./architecture/ARCHITECTURE.md)                         |
| Server vs client; who owns which state; invalidation | [`architecture/RENDERING_AND_STATE.md`](./architecture/RENDERING_AND_STATE.md)           |
| Forms, validation, mutations                         | [`architecture/FORMS.md`](./architecture/FORMS.md)                                       |
| Sessions, Telegram, authorisation, privacy           | [`architecture/AUTH_AND_SECURITY.md`](./architecture/AUTH_AND_SECURITY.md)               |
| Which routes are public; robots; canonical URLs      | [`architecture/DOMAINS_AND_INDEXING.md`](./architecture/DOMAINS_AND_INDEXING.md)         |
| What the backend must provide                        | [`api/API_CONTRACT.md`](./api/API_CONTRACT.md)                                           |
| Colour, type, spacing, motion                        | [`design/design-system.md`](./design/design-system.md)                                   |
| Which component to reuse                             | [`design/component-library.md`](./design/component-library.md)                           |
| Loading, empty, error, destructive states            | [`design/interaction-and-states.md`](./design/interaction-and-states.md)                 |
| Accessibility requirements                           | [`design/accessibility.md`](./design/accessibility.md)                                   |
| Copy, translation keys, three locales                | [`design/content-and-i18n.md`](./design/content-and-i18n.md)                             |
| A specific workflow                                  | [`features/`](./features/)                                                               |
| Local setup, environment, deployment, checks         | [`operations/DEVELOPMENT_AND_DEPLOYMENT.md`](./operations/DEVELOPMENT_AND_DEPLOYMENT.md) |
| Adding a feature end to end                          | [`guides/building-a-feature.md`](./guides/building-a-feature.md)                         |

After picking a domain, search [`../.agent-memory/`](../.agent-memory/) for it.
Memory records expensive discoveries and the reasoning behind non-obvious
decisions; it never overrides current code or this documentation.

## Topology

```text
docs/
  product/       Scope, roles, domain concepts
  architecture/  System, requests, state, forms, security, indexing
  api/           What the backend must provide, and what is still assumed
  design/        Tokens, components, states, accessibility, content
  features/      Per-workflow behaviour and constraints
  operations/    Environment, development, deployment, verification
  guides/        Repeatable playbooks
```

## The one thing to know before reading anything else

**There is no YVC backend yet.** Every request module in `src/features/*/api.server.ts`
codes against a contract this repository _proposes_ rather than one it has
verified. Those proposals are collected in
[`api/API_CONTRACT.md`](./api/API_CONTRACT.md), and each is labelled.

The consequences show up everywhere and are deliberate:

- Opportunity reads fall back to a clearly-labelled sample set behind
  `YVC_ENABLE_SAMPLE_DATA`, so the UI and the tests have something to run
  against. The interface says on screen when it is doing this.
- Authenticated pages render a specific "not connected" state rather than a
  spinner that never resolves.
- The signed-in end-to-end journeys are declared and skipped with the blocker
  named, not deleted and not faked.

## Documentation rules

- One canonical location per concept. Cross-link; do not copy.
- Point at exact implementation paths where that saves rediscovery.
- Update the owning document in the same change as the behaviour.
- Record uncertainty explicitly as **Unknown**, **Assumed**, or
  **Needs verification**. An assumption written down is useful; one dressed up
  as fact is a trap.
- Never store credentials, tokens, environment values, or personal data.

**Source priority when facts conflict:** executable code; configuration and
schemas; `AGENTS.md`; current `/docs`; `.agent-memory`; older plans and
handoffs. A conflict still needs investigating — documentation sometimes
describes an invariant the code is quietly violating.
