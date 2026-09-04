# Volontyorlar App Documentation

Use this file to route project questions to the smallest relevant source.

| Task                                                                          | Read                                                                                                                   |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Product truth, the volunteer loop, levels, the three-repository boundary      | [`../PRODUCT.md`](../PRODUCT.md)                                                                                       |
| The design system as applied to the product                                   | [`../DESIGN.md`](../DESIGN.md)                                                                                         |
| Routes, rendering, module ownership, dependency boundary                      | [`architecture/ARCHITECTURE.md`](architecture/ARCHITECTURE.md)                                                         |
| Origins, environment variables, hosting topology                              | [`architecture/DOMAINS.md`](architecture/DOMAINS.md)                                                                   |
| Domain concepts and where each rule is implemented                            | [`product/DOMAIN_MODEL.md`](product/DOMAIN_MODEL.md)                                                                   |
| What a volunteer needs on the dashboard, and why each block exists            | [`product/VOLUNTEER_DASHBOARD.md`](product/VOLUNTEER_DASHBOARD.md)                                                     |
| **How to make sign-in and the dashboard real** — phases, contracts, decisions | [`plans/AUTH_AND_DASHBOARD_IMPLEMENTATION_PLAN.md`](plans/AUTH_AND_DASHBOARD_IMPLEMENTATION_PLAN.md)                   |
| Dashboard information, motion, scroll stability, and verification plan        | [`plans/DASHBOARD_INFORMATION_MOTION_AND_STABILITY_PLAN.md`](plans/DASHBOARD_INFORMATION_MOTION_AND_STABILITY_PLAN.md) |
| Full frontend audit and resolved information-architecture findings            | [`reviews/FRONTEND_DIAGNOSIS.md`](reviews/FRONTEND_DIAGNOSIS.md)                                                       |
| Applied UI system, localization behaviour, accessibility rules                | [`ui/UI_SYSTEM.md`](ui/UI_SYSTEM.md)                                                                                   |
| Security headers, CSP, secrets, trust boundaries                              | [`security/SECURITY.md`](security/SECURITY.md)                                                                         |
| Setup, commands, environment, CI, deployment                                  | [`operations/DEVELOPMENT_AND_DEPLOYMENT.md`](operations/DEVELOPMENT_AND_DEPLOYMENT.md)                                 |
| Adding a section, copy, locale, token, component, or link                     | [`operations/EXTENDING.md`](operations/EXTENDING.md)                                                                   |
| A non-obvious decision, discovery, or gotcha                                  | [`../.agent-memory/README.md`](../.agent-memory/README.md)                                                             |

## Reference material

[`reference/foundation-v1/`](reference/foundation-v1/README.md) holds the
previous foundation of this repository: its documentation, the agent handoff
that produced it, and its source under `legacy/`. It is a historical input,
not a live specification. Where it and the code disagree, the code and this
folder win. The implementation plan names the parts of it worth porting.

## Source-of-truth order

When sources disagree, investigate in this order:

1. executable code;
2. current configuration;
3. `AGENTS.md`;
4. current `/docs`;
5. persistent memory;
6. reference material, old comments, plans, and history.

## Documentation boundary

These pages separate three kinds of truth:

- **Implemented** — verified in current source or configuration.
- **Presented** — product direction, but not proof of an implementation.
- **Needs verification** — no evidence is available in the workspace.

Unknowns stay explicit. They are not filled with assumed contracts, hostnames,
or partner claims.
