# Source files carry no comments; explanations live in /docs

The same rule as the marketing site, applied across `src/`, `e2e/`, and the
root configs. There is no stripping script here any more; the rule is kept by
review and by the docs being the place a reader looks.

Where things go:

- Component and token rationale → `docs/ui/UI_SYSTEM.md` and `DESIGN.md`
- Rendering, client boundary, and configuration → `docs/architecture/ARCHITECTURE.md`
- Why a block exists → `docs/product/VOLUNTEER_DASHBOARD.md`
- What a rule means → `docs/product/DOMAIN_MODEL.md` and `PRODUCT.md`
- Everything a contributor needs before touching the code → `docs/operations/EXTENDING.md`
- Why a road was taken → this folder

Compiler and linter directives — `@ts-expect-error`, `eslint-disable` — are
not comments and stay. A test name is the right place for "this must never
happen": `volunteer.test.ts` says "never names a real partner or source as an
organiser" rather than a comment above the data.
