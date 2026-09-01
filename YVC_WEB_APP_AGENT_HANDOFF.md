# YVC Product Web Application — Final Agent Handoff

## Mission

Build the separate production-grade YVC product web application.

This is **not** the marketing site.

The application should become the operational product through which volunteers discover opportunities, maintain reusable profiles, apply, build a track record, and later interact with partner organizations.

Use the architecture patterns from the supplied Dwelve repositories as references, but improve their weaknesses rather than cloning them.

---

# 1. Repositories to study first

## Reference marketing repository
- `DwelveOrg/dwelve`
- Purpose: understand how public marketing content is kept separate from authenticated product workflows.

## Reference application repository
- `DwelveOrg/app`
- Purpose: study:
  - Next.js App Router organization;
  - server/client boundaries;
  - route-local `_components`, `_hooks`, `_lib`, `_types`, `_schemas`;
  - server-only backend request stack;
  - TanStack Query ownership;
  - form conventions;
  - documentation router;
  - agent memory;
  - auth/session boundary patterns.

## Current YVC marketing repository
- `volontyorlarOrg/v-web`
- Purpose:
  - read the YVC product/brand context;
  - reuse brand assets/tokens where appropriate;
  - do not put app functionality back into this repo.

### Important

Do not blindly copy Dwelve packages or code.

Dwelve's product domain is different, and its repos still contain some residue/technical debt, including a lack of a first-party automated testing suite in the current documented architecture.

Keep useful patterns.
Discard domain-specific assumptions and unnecessary dependencies.

---

# 2. Canonical YVC product truth

Official name:

**Youth Volunteer Club (YVC)**

Founded:
- June 4, 2025

Founders:
- Arslon Rajabov
- Parizoda Abdurakhimova

YVC helps young people discover and apply to meaningful volunteering opportunities.

YVC has evolved from listing opportunities into:
- actively finding opportunities;
- contacting organizers;
- sourcing events;
- building partnerships;
- supplying volunteers.

Known current traction:
- 3,600+ Telegram followers;
- 220+ Instagram followers;
- volunteer work for 50+ events;
- partnership with O'ZLIDEP Party;
- support/recognition from the Youth Affairs Agency;
- support/recognition from the Uzbekistan Volunteer Association;
- support/recognition from the Republican Children's Library;
- regional expansion toward all 14 regions;
- 500+ applications for regional project manager/coordinator roles.

Current content category:
- volunteering opportunities.

Do not prematurely turn this into a generic job board, grant marketplace, internship marketplace, or social network.

Architecture may leave clean extension points for future opportunity types, but the initial product model must remain centered on volunteering.

---

# 3. Core product loop

The application architecture must optimize this loop:

```text
Discover opportunity
        ↓
Understand requirements
        ↓
Sign in / create account
        ↓
Complete reusable volunteer profile
        ↓
Apply using saved information
        ↓
Write opportunity-specific answers/essays
        ↓
Save draft
        ↓
Submit
        ↓
Track application status
        ↓
Attend if accepted
        ↓
Attendance/reliability confirmed
        ↓
Volunteer track record improves
        ↓
Future applications become easier and more credible
```

Long-term partner loop:

```text
Organization creates/supplies opportunity
        ↓
Receives applicants
        ↓
Reviews volunteer profiles + track record
        ↓
Accepts volunteers
        ↓
Confirms attendance/performance
        ↓
YVC reputation data becomes more useful
```

This feedback loop is the product moat.

Do not let the architecture devolve into “a prettier list of Telegram posts.”

---

# 4. Users and roles

Model roles carefully.

Initial logical roles:
- volunteer;
- YVC administrator;
- partner/organization member.

Potential later role:
- regional coordinator/project manager.

Do not implement coordinator authorization merely because regional expansion exists operationally. Implement it only when an actual product workflow/backend contract exists.

### Authorization rule

Frontend role checks are for UX only.

The backend must enforce all permissions.

Hidden buttons are not security.

A user's identity and organization membership must come from the trusted session/backend, not from client-controlled form fields.

---

# 5. Core domain model

Do not finalize backend schemas from this document alone, but use these concepts to organize frontend ownership.

## User
Global account identity.

## VolunteerProfile
Reusable volunteer information, for example:
- name;
- school/education information;
- grade/year if required;
- region;
- languages;
- skills/interests;
- contact methods;
- biography;
- optional links;
- profile completion state.

Collect only data that has a real product use.

## Opportunity
Core marketplace object:
- title;
- organization;
- description;
- location/region;
- format;
- date/time;
- application deadline;
- requirements;
- capacity if applicable;
- status;
- application questions;
- partner/source;
- images;
- slug/id.

## Application
A volunteer's application to one opportunity:
- draft/submitted state;
- answers;
- reusable profile snapshot/reference;
- status;
- timestamps;
- reviewer outcome.

## ApplicationAnswer / Essay
Opportunity-specific answers.

Support reuse where the product intentionally allows it, but never silently submit an old essay to a new opportunity.

## SavedOpportunity
Bookmark/favorite relation.

## VolunteerRecord
Derived view of verified participation:
- completed events;
- attendance;
- reliability;
- verified hours if YVC chooses to track hours;
- reviews/ratings if implemented;
- level/reputation if formally defined.

Do not display an authoritative “rating” until its formula and source are defined.

## AttendanceRecord
Must distinguish:
- accepted;
- attended;
- excused/cancelled where applicable;
- organizer not yet confirmed.

Never reduce reliability because the organizer failed to confirm attendance.

## Organization / Partner
Public and private organization identity.

## Review / Rating
Future-facing unless a real backend contract exists.

Do not invent scoring algorithms.

---

# 6. Public vs private routes

Do **not** copy Dwelve's blanket “entire app is non-indexable” policy.

YVC is different because opportunities are inherently public/discoverable content.

Use route-level indexing rules.

## Potentially public/indexable
Only after canonical-host/product decision is verified:
- opportunity discovery;
- opportunity detail pages;
- public organization pages;
- public volunteer share profile, if product explicitly supports it and privacy has been designed.

## Always private/noindex
- login/signup;
- onboarding;
- personal profile editor;
- saved opportunities;
- application drafts;
- application history;
- volunteer dashboard;
- partner dashboard;
- admin;
- private review screens;
- private attendance records;
- settings.

Private responses should use suitable cache/noindex headers.

Do not expose personal application data to search engines.

---

# 7. Recommended frontend stack

## Core
- Next.js 16 App Router
- React 19
- strict TypeScript
- Node.js 22+
- Tailwind CSS 4

## UI
- shadcn-compatible primitives
- Lucide React
- class-variance-authority
- clsx
- tailwind-merge
- Sonner for toasts

Do not add a second component system.

## Localization
Use:
- `next-intl`

Target:
- Uzbek (`uz`);
- Russian (`ru`);
- English (`en`).

Use URL-aware localization where practical and keep server rendering compatible.

## Forms
Use:
- `react-hook-form`;
- `zod`;
- `@hookform/resolvers`.

For server mutation boundaries, prefer either:
- plain typed Server Actions with a standardized result envelope; or
- `next-safe-action` if the repository adopts it consistently.

Do not mix several competing action abstractions.

If `next-safe-action` is adopted, document it as the one approved client-triggered mutation boundary.

## Server/client data
Use:
- Next.js Server Components for initial server data;
- TanStack Query for dynamic client server-state;
- centralized query keys;
- explicit invalidation.

Do not use React Query for every initial page read.

Do not duplicate server data in Zustand.

## URL state
Use:
- `nuqs`

for:
- opportunity filters;
- search;
- sorting;
- pagination;
- tab state only when it should be shareable/bookmarkable.

## Client UI state
Do **not** install/use Zustand by default.

Add Zustand only when a genuine cross-component/cross-route client-only state problem appears that is not:
- server state;
- URL state;
- form state;
- local component state.

## Dates
Use:
- native `Intl`;
- `date-fns` where actual date manipulation makes it worthwhile.

## Tables
Use:
- `@tanstack/react-table`

only for real data-heavy admin/partner tables.

Do not use it for ordinary card lists.

## Motion
Use:
- `motion`

sparingly for:
- page/step transitions;
- application progress;
- meaningful dialog/list feedback.

Respect reduced-motion preferences.

## API typing
Preferred:
- backend publishes OpenAPI;
- generate TypeScript API types;
- use `openapi-fetch` or an equivalent small typed client inside the server-only API layer.

If no OpenAPI contract exists:
- use a centralized native-fetch wrapper;
- validate UI-critical backend JSON with Zod schemas;
- document the temporary contract.

Do not maintain both a full handwritten API type system and a generated one without a reason.

## Error monitoring
Production:
- `@sentry/nextjs`

only once a real project/config exists.

## Product analytics
If deployed on Vercel:
- `@vercel/analytics`;
- `@vercel/speed-insights`.

Do not send volunteer PII, essays, phone numbers, or application text to analytics.

## Testing
- Vitest;
- React Testing Library;
- `@testing-library/jest-dom`;
- `@testing-library/user-event`;
- Playwright.

Automated tests are part of the target architecture, not an optional someday-cleanup.

---

# 8. Suggested dependency policy

## Install/approve now when the feature requires it
- `next`
- `react`
- `react-dom`
- `next-intl`
- `lucide-react`
- `react-hook-form`
- `zod`
- `@hookform/resolvers`
- `@tanstack/react-query`
- `nuqs`
- `sonner`
- `date-fns`
- `motion`
- shadcn-related primitive dependencies

## Add only when justified
- `@tanstack/react-table`
- `openapi-fetch`
- generated OpenAPI tooling
- Zustand
- Sentry
- Vercel analytics
- Vercel speed insights
- upload libraries
- rich text editor
- drag-and-drop
- charting
- PDF tooling

## Do not add by default
- Redux;
- Axios;
- Formik;
- Material UI;
- Chakra;
- Ant Design;
- a second schema library;
- a second query library;
- a second toast system;
- multiple date libraries.

---

# 9. Route architecture

Use route groups to represent product boundaries, not arbitrary folders.

Suggested direction:

```text
src/app/
  [locale]/
    (public)/
      opportunities/
        page.tsx
        [slug]/
          page.tsx

    (auth)/
      login/
      signup/
      auth/
        telegram/

    (volunteer)/
      dashboard/
      profile/
      saved/
      applications/
        page.tsx
        [applicationId]/
          page.tsx
      settings/

    (partner)/
      partner/
        dashboard/
        opportunities/
        applicants/

    (admin)/
      admin/
        opportunities/
        applications/
        attendance/
        partners/

  api/
    # only when a same-origin browser endpoint is genuinely needed
```

Exact URLs may change with product decisions.

Keep route-local implementation near the route:

```text
feature-route/
  page.tsx
  loading.tsx
  error.tsx
  _components/
  _hooks/
  _lib/
  _types/
  _schemas/
```

Do not create every folder automatically.

---

# 10. Component architecture

Recommended:

```text
src/components/
  ui/               # low-level primitives
  shared/           # genuinely cross-domain product components
  opportunities/
  applications/
  volunteers/
  organizations/
```

Route-specific components should stay route-local until they are genuinely shared.

Do not promote a component to `shared/` because it is used twice by accident.

### UI primitives

Prefer:
- Button;
- Input;
- Textarea;
- Select;
- Checkbox;
- Radio;
- Dialog;
- Drawer/Sheet;
- Tabs;
- Badge;
- Tooltip;
- Dropdown;
- Skeleton;
- Empty state;
- Error state;
- Pagination;
- Form field wrapper;
- Avatar;
- Progress.

Build product components on top:
- `OpportunityCard`;
- `OpportunityFilters`;
- `OpportunityDeadline`;
- `ApplicationForm`;
- `EssayField`;
- `ApplicationStatus`;
- `VolunteerRecordCard`;
- `ReliabilityIndicator`;
- `ApplicantRow`;
- `OrganizationBadge`.

---

# 11. Server/client rendering rules

Default to server.

A typical page:

```text
page.tsx                 Server Component
  ↓ fetches initial data
View / interactive leaf  Client Component
  ↓ events/forms/mutations
shared primitives
```

Use `"use client"` only for:
- React state/effects;
- event handlers;
- browser APIs;
- React Query hooks;
- React Hook Form;
- interactive component primitives;
- Motion.

Do not mark whole route trees client-side just because one button is interactive.

---

# 12. Backend request architecture

All private backend requests must go through one server-side transport layer.

Do not call the private API origin directly from React components.

Suggested shape:

```text
src/lib/api/
  client.server.ts
  errors.ts
  types.ts          # generated or temporary
```

Then domain endpoint modules:

```text
src/features/opportunities/api.server.ts
src/features/applications/api.server.ts
src/features/profile/api.server.ts
```

or route-local equivalents.

Rules:
1. API origin lives in a server-only environment variable.
2. No private bearer token in client JavaScript.
3. No API origin duplicated throughout components.
4. Request errors have one normalized shape.
5. Timeouts are explicit.
6. JSON parsing failures are handled.
7. Backend response trust boundary is documented.
8. Authenticated requests attach credentials in one place.
9. Retry/token refresh logic is centralized.
10. Sensitive error details are not leaked to users.

For public opportunity reads, server rendering may call a public backend endpoint directly through the same server API layer.

---

# 13. Authentication and Telegram

Telegram is a planned/high-priority authentication path.

Do not invent its backend protocol.

Requirements:
- browser receives only data needed for the client auth interaction;
- Telegram-provided identity/auth payload must be verified server-side/backend-side;
- never trust Telegram user fields simply because JavaScript received them;
- session establishment must happen through trusted server/backend logic;
- store session in secure HTTP-only cookies;
- do not store access/refresh tokens in localStorage;
- secure cookies in production;
- set sensible SameSite policy;
- rotate/refresh tokens centrally if token-based backend auth is used;
- logout invalidates the server session.

Google/email auth can be added later if product scope requires it.

Do not install Clerk/Auth0/etc. unless the maintainers deliberately select them.

---

# 14. Session and authorization

The app should treat the server session as the source of authenticated identity.

Frontend must never send trusted identity fields such as:
- `userId`;
- `volunteerId`;
- organization membership role

merely because a form included them.

Derive trusted identity from session/backend context.

Authorization must be validated by the backend for every protected operation.

---

# 15. State ownership

Use this ownership table.

| State | Owner |
|---|---|
| Initial page data | Server Component |
| User-triggered dynamic reads | TanStack Query |
| Mutations | Server action/API boundary + TanStack mutation when client cache is involved |
| Search/filter/sort/page | URL via nuqs |
| Form | React Hook Form |
| Theme | next-themes only if product ships theme switching |
| Locale | URL / next-intl |
| Tiny component state | local React state |
| Genuine shared client-only state | Zustand only if justified |
| Auth/session | server |

Never mirror server records into local state merely to make them editable. Create an explicit form/draft model.

---

# 16. TanStack Query conventions

If TanStack Query is introduced:

1. one centralized provider;
2. one central query-key factory;
3. no raw inline key arrays;
4. feature hooks named predictably;
5. invalidation belongs to the mutation hook/action owner;
6. queries are for client-dynamic server state, not for every page load;
7. pagination/filter keys include their inputs;
8. define sane stale/retry policy;
9. avoid refetch storms on focus;
10. use polling only when product freshness requires it.

Do not implement real-time systems for human workflows that tolerate 30–60 second freshness unless there is a proven need.

---

# 17. Opportunity discovery

Opportunity browsing is a primary product surface.

Requirements:
- mobile-first;
- fast from Telegram/social deep links;
- search;
- region;
- date/deadline;
- organization/source;
- type/category only if the backend has a real taxonomy;
- status/open/closed;
- pagination or cursor loading;
- empty states;
- loading states;
- failed-load states.

Use URL-backed filters so links are shareable.

Example:

```text
/uz/opportunities?region=tashkent&sort=deadline&page=2
```

Do not hide the state entirely inside React.

Opportunity detail should clearly show:
- organizer;
- date;
- location;
- deadline;
- requirements;
- description;
- application status/CTA;
- verified source/partner context when applicable.

---

# 18. Volunteer profile

Goal: complete information once, reuse it.

Profile must distinguish:
- reusable personal/profile data;
- opportunity-specific application answers.

Do not blindly prefill application essays as if every opportunity asks the same thing.

Support profile completion/progress only if the completion model is explicitly defined.

Consider draft autosave for long profile editing.

Never lose unsaved data silently.

---

# 19. Application architecture

Application states should come from backend truth.

Potential states:
- draft;
- submitted;
- under_review;
- accepted;
- rejected;
- withdrawn;
- closed.

Do not hard-code these until backend/domain contract confirms the enum.

### Form flow

Recommended:

```text
Zod schema
   ↓
React Hook Form
   ↓
field components
   ↓
typed server mutation boundary
   ↓
backend
   ↓
TanStack invalidation / RSC refresh
   ↓
status feedback
```

Form requirements:
- complete default values;
- inline field errors;
- root submission error;
- loading/disabled state;
- retry-safe behavior;
- accessible labels;
- draft saving for long applications;
- explicit submit confirmation when submission becomes immutable.

Essay UX:
- character/word limit only if backend/product defines one;
- autosave after idle;
- save state visible;
- never lose long answers on accidental refresh/navigation when avoidable.

---

# 20. Volunteer record, reliability, and rating

Treat reputation as high-trust product data.

Do not display arbitrary stars.

If the backend formally defines:
- events completed;
- verified hours;
- attendance;
- reliability;
- reviews;
- volunteer level;

render them transparently.

Any derived score should have:
- documented formula;
- understandable meaning;
- source/verification rules;
- no punishment for organizer confirmation failure.

If YVC keeps the proposed level system, put the formula in one canonical product/domain document and derive labels from backend truth.

Do not duplicate formulas across JSX.

---

# 21. Partner organization application review

When implemented:

Partner users need:
- opportunity management or access to assigned opportunities;
- applicant list;
- filters;
- volunteer profile summary;
- track-record summary;
- application answers;
- accept/reject/review actions;
- attendance confirmation after event.

Use TanStack Table only when the applicant set genuinely benefits from a table.

Mobile/tablet behavior matters.

Do not expose private volunteer information beyond what the partner is authorized to see.

---

# 22. Admin

Admin is an operational tool, not a prettier copy of the volunteer UI.

Potential responsibilities:
- opportunity creation/editing;
- partner/source management;
- applications;
- attendance;
- reputation/review correction workflows;
- content moderation;
- regional operations later.

Every admin mutation must be backend-authorized.

For dangerous actions:
- confirmation;
- clear destructive styling;
- auditability if backend supports it.

---

# 23. Localization

Support from the beginning:
- Uzbek;
- Russian;
- English.

Requirements:
- all user-facing strings localized;
- no hard-coded English buried in validation/toasts;
- localized date/time using `Intl`;
- locale-aware metadata for public opportunity pages;
- route-preserving language switch;
- translation keys grouped by domain;
- avoid one gigantic flat translation file.

Validation errors should use stable error codes/keys where possible instead of trying to translate backend English sentences.

---

# 24. Mobile-first UX

Most volunteer acquisition may come from Telegram/social links.

Optimize:
- small-screen opportunity cards;
- fast detail page;
- thumb-friendly apply CTA;
- short onboarding;
- saved progress;
- bottom sheets where appropriate;
- no desktop-only hover discovery;
- limited JS;
- image optimization;
- fast return from Telegram webview/browser.

Test at:
- ~360px;
- ~390px;
- tablet;
- desktop.

---

# 25. Accessibility

Required:
- semantic headings;
- associated labels;
- keyboard navigation;
- focus management;
- visible focus;
- accessible dialogs;
- `aria-invalid`;
- error descriptions;
- screen-reader-friendly status changes;
- reduced motion;
- non-color-only status indicators;
- accessible table/card alternatives;
- sufficient contrast;
- no inaccessible custom drag/drop unless a keyboard/button fallback exists.

---

# 26. Privacy and youth-safety engineering

YVC serves young people, potentially including minors.

Frontend rules:
- collect minimum necessary personal information;
- no PII in URLs;
- no application essays in analytics;
- no phone/email in logs;
- no session tokens in localStorage;
- no sensitive profile data cached in browser storage without a documented need;
- private pages should not be cached/indexed as public content;
- partner views must follow backend authorization;
- error reporting must scrub user content.

Do not make legal claims about consent/retention unless product/legal policy exists.

Document unresolved privacy-policy requirements.

---

# 27. Analytics

Analytics should answer product questions, not collect everything.

Examples:
- opportunity viewed;
- apply started;
- signup started;
- profile completed;
- application draft saved;
- application submitted;
- application abandoned;
- opportunity saved;
- filter applied.

Never send:
- essays;
- names;
- phone numbers;
- Telegram handles;
- school names linked to an identifiable person;
- private reviewer notes.

Use centralized typed event definitions.

---

# 28. Error handling

Establish:
- route `error.tsx`;
- `loading.tsx`;
- empty states;
- not-found handling;
- forbidden state;
- session-expired state;
- network/backend failure state.

Distinguish:
- 401 unauthenticated;
- 403 forbidden;
- 404 missing;
- validation error;
- conflict/already applied;
- generic server error.

Do not collapse every failure into “Something went wrong.”

Do not leak backend stack traces or internal messages.

---

# 29. Testing strategy

This is a mandatory improvement over the current Dwelve baseline.

## Unit
Vitest:
- schema helpers;
- query-key factories;
- reputation display helpers;
- URL/filter parsers;
- API error classification;
- localization helpers.

## Component
React Testing Library:
- application fields;
- opportunity filters;
- status components;
- dialogs;
- language switcher;
- profile completion UI.

## E2E
Playwright critical paths:

### Public
1. open opportunity list;
2. filter by region;
3. open opportunity;
4. switch language;
5. deep link still works.

### Volunteer
1. sign in through available test auth;
2. complete profile;
3. start application;
4. enter essay;
5. save draft;
6. reload;
7. draft persists;
8. submit;
9. see application status/history.

### Partner
1. sign in as partner;
2. open applicants;
3. inspect applicant;
4. change review status;
5. UI refreshes correctly.

### Security/privacy smoke
- private route redirects when logged out;
- private route is noindex;
- volunteer cannot reach partner/admin route by UI or direct URL;
- user content is not written to public URL query parameters.

Do not pretend E2E passed if backend/test fixtures are unavailable. Report the blocker precisely.

---

# 30. Documentation architecture

Copy the good documentation discipline from Dwelve, not its product content.

Recommended:

```text
AGENTS.md
PRODUCT.md

docs/
  README.md

  product/
    PRD.md
    DOMAIN_MODEL.md

  architecture/
    SYSTEM_DESIGN.md
    ARCHITECTURE.md
    RENDERING_AND_STATE.md
    FORMS.md
    AUTH_AND_SECURITY.md
    DOMAINS_AND_INDEXING.md

  api/
    API_CONTRACT.md

  design/
    design-system.md
    component-library.md
    accessibility.md
    content-and-i18n.md
    interaction-and-states.md

  features/
    opportunities.md
    volunteer-profile.md
    applications.md
    volunteer-record.md
    partner-review.md
    admin.md

  operations/
    DEVELOPMENT_AND_DEPLOYMENT.md

  guides/
    building-a-feature.md
```

Do not create empty documentation merely to satisfy this tree.

`docs/README.md` must act as a context router.

`.agent-memory/` should record:
- non-obvious decisions;
- costly discoveries;
- recurring bugs;
- backend quirks;
- gotchas.

It should not contain daily progress logs.

---

# 31. Suggested implementation phases

## Phase 0 — Repository audit
- inspect target repo;
- inspect all three reference repos;
- inventory packages;
- inventory reusable YVC brand assets;
- identify backend/API information available;
- identify unknowns.

## Phase 1 — Foundation
- Next.js/React/TS/Tailwind;
- lint/format;
- locale architecture;
- design tokens;
- component primitives;
- route skeleton;
- error/loading/not-found boundaries;
- test infrastructure;
- docs router.

## Phase 2 — API/auth boundary
- server-only backend client;
- normalized errors;
- OpenAPI integration if available;
- session helper;
- Telegram auth integration only from verified backend contract;
- protected route policy.

## Phase 3 — Opportunities
- public list;
- detail;
- URL filters;
- loading/empty/error;
- locale/metadata;
- application CTA.

## Phase 4 — Volunteer identity
- signup/onboarding;
- profile;
- saved opportunities;
- profile persistence;
- settings.

## Phase 5 — Applications
- application schema;
- draft;
- essay UX;
- autosave;
- submit;
- history/status;
- invalidation/freshness.

## Phase 6 — Volunteer record
- verified participation data;
- reliability;
- history;
- rating/level only when backend rules are defined.

## Phase 7 — Partner/admin
Only after real backend permissions/contracts exist:
- partner applicant review;
- attendance confirmation;
- opportunity management;
- admin operations.

## Phase 8 — Production hardening
- Playwright;
- Sentry;
- analytics;
- performance;
- security headers;
- noindex/private cache review;
- accessibility;
- responsive QA.

---

# 32. Branch and change discipline

Unless repository policy says otherwise:
- do not do architectural migration directly on `main`;
- work on a focused branch;
- keep commits coherent;
- do not mix unrelated visual redesigns with backend/auth architecture unless required;
- preserve unrelated worktree changes;
- do not rewrite reference repositories.

If this task is only a handoff inside an existing agent branch, continue that branch rather than creating nested branches.

---

# 33. Non-negotiable forbidden patterns

Do not:
- build the authenticated app inside `volontyorlarOrg/v-web`;
- copy Dwelve branding/domain/env values;
- expose backend tokens to the browser;
- store auth tokens in localStorage;
- use client-side role checks as authorization;
- call private API URLs from random components;
- use `any` as an API-contract strategy;
- duplicate server state into Zustand;
- put opportunity filters only in local component state;
- introduce Redux “for scalability”;
- install Axios without a real gap;
- add three UI libraries;
- hard-code English copy;
- invent ratings/reliability formulas;
- fabricate backend endpoint contracts;
- fabricate Telegram auth behavior;
- put essays/PII into analytics;
- make private dashboards indexable;
- copy Dwelve's blanket noindex policy to public YVC opportunity pages without a product decision;
- claim tests passed when they did not run.

---

# 34. Definition of done for architecture foundation

The architecture foundation is complete only when:

- marketing and product repos have a clear documented boundary;
- product identity is correct;
- supported locales are documented;
- API calls have one server-only boundary;
- auth/session ownership is documented;
- server/client rendering rules are documented;
- form conventions are documented;
- query/state ownership is documented;
- route indexing rules distinguish public opportunities from private account data;
- design tokens/components are established;
- tests are configured;
- docs router exists;
- environment variables are documented without secrets;
- build/lint/typecheck pass;
- remaining backend/domain unknowns are explicitly marked.

---

# 35. Final agent report

At the end of the task report:

1. Target repository and branch.
2. Repositories inspected.
3. Existing architecture discovered.
4. Architecture flaws found.
5. Architecture decisions made.
6. Files created/updated/removed.
7. Dependencies added/removed.
8. API/auth assumptions verified.
9. API/auth unknowns remaining.
10. Routes implemented.
11. Localization status.
12. Testing status.
13. Security/privacy work.
14. Performance/accessibility work.
15. Documentation updates.
16. Exact commands run and results.
17. Remaining blockers or product decisions.

Label assumptions explicitly.

Do not hide uncertainty behind confident prose.
