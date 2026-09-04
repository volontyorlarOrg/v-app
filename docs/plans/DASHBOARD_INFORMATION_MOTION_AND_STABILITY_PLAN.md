# Dashboard Information, Motion, and Stability Plan

This plan turns the broad dashboard request into a bounded implementation brief
for the authenticated Volontyorlar application. It covers information
architecture, navigation, motion, scroll stability, and verification. It does
not turn sample data or unimplemented backend actions into product claims.

## Improved implementation prompt

> Review the complete authenticated `v-app` experience as a volunteer task
> flow, with the dashboard as the starting point. Prioritize information and
> content structure over a visual redesign. Identify what a volunteer needs to
> know or do next, remove repeated summaries, merge closely related
> destinations, and keep every remaining feature reachable. Simplify the top
> bar to global controls only. Diagnose the intermittent scrolling issue with
> browser evidence and remove any animation or scroll layer that can hide or
> block content. Add one restrained, product-specific Three.js object to show
> progress and participation, loaded only in the browser, paused offscreen,
> and replaced by a static composition for reduced motion or missing WebGL.
> Preserve all three locales, sample-data disclosures, private-page indexing
> rules, theme behavior, keyboard access, mobile navigation, and existing
> domain logic. Update tests and documentation, run lint, typecheck, unit,
> build, and route-level browser checks at mobile and desktop widths, then
> review the final diff before committing only the intended work.

## Evidence from the existing implementation

- The dashboard repeated four figures and seven panels before a volunteer
  reached the end of the page. Saved opportunities, recent activity, and
  closing-soon items already had stronger homes elsewhere.
- Desktop navigation exposed seven destinations. Mobile exposed five, but one
  was Saved while the participation record was absent.
- The top-bar search duplicated the full opportunity search and filter form.
- The page scrolled in the browser, but every `Panel` remained at `opacity: 0`
  because visibility depended on an observer releasing `data-scene` elements.
  The result looked like a broken or frozen page.
- Lenis added a second scroll runtime to an operational interface without a
  task-specific need.

## Information architecture

The primary destinations are:

1. Dashboard — the next commitment, current applications, and progress.
2. Opportunities — all opportunities and the saved subset in one view.
3. Applications — drafts, active applications, and decisions.
4. Record — confirmed participation and level rules.

Profile is the single account destination and includes essential settings;
the old Settings route redirects there. Mobile keeps Dashboard,
Opportunities, Applications, and Profile as four thumb-sized tabs. The Record
is linked from the dashboard progress summary and desktop navigation. The old
Saved route redirects to the saved Opportunities view so bookmarks and older
links do not fail.

## Page-level content decisions

### Dashboard

- Keep one primary action: browse opportunities.
- Keep the three useful figures: completed events, reliability, and hours.
- Keep three panels: Next up, Applications, and Progress.
- Combine record progress and profile completeness because both answer “what
  improves my next application?”
- Remove recent activity because notifications already communicate changes.
- Move closing-soon and saved lists into Opportunities.

### Opportunities and applications

- Add All and Saved views above the existing filters.
- Preserve URL-backed filters and keep the selected Saved view through form
  submissions and filter clearing.
- Keep application status groups because they represent distinct tasks rather
  than duplicate destinations.

### Profile and settings

- Consolidate the profile from six panels to three: About you, Languages and
  skills, and Contact, with education, location, and links as subsections.
- Consolidate essential settings into Profile: Telegram and deadline
  notifications, organiser profile visibility, theme, language, connected
  identities, and sign out. Hide future controls until their contracts exist.

## Motion and Three.js budget

- The authored moment is a small orbit model on the dashboard: a central
  faceted form, level rings, and four milestones. It supports the progress
  story without carrying data that must be read.
- Three.js loads through a client-side dynamic import. The renderer uses a
  capped pixel ratio and low-power preference, pauses when offscreen or when
  the document is hidden, and disposes all GPU resources on unmount.
- Reduced motion gets the static CSS orbit. Missing WebGL keeps the same static
  composition.
- Page content is visible in server HTML. No observer, animation, or renderer
  may gate reading or scrolling.
- Native scrolling and CSS `scroll-padding-top` replace Lenis.

## Execution and verification

1. Baseline: record Git state; run lint, typecheck, and unit tests; reproduce
   the scroll failure at phone and desktop widths.
2. Structure: update the route registry, tab bar, Saved redirect, dashboard,
   profile, settings, and translated catalogs.
3. Stability: remove the Lenis mount and JS-dependent panel visibility; keep
   horizontal overflow clipped without creating a second scroll container.
4. Motion: add the lazy Three.js orbit and static reduced-motion fallback.
5. Documentation: update dashboard, UI-system, architecture, and extension
   guidance to match the code.
6. Static gates: format check, lint, Next.js type generation, strict
   TypeScript, unit tests, build, detector, and `git diff --check`.
7. Browser gates: dashboard, opportunities, applications, record, profile,
   and settings at phone and desktop widths; light and dark themes; normal and
   reduced motion; keyboard-visible navigation; no horizontal overflow; and
   successful scrolling to the final page content.
8. Git gate: fetch, compare with `origin/main`, inspect all staged paths,
   commit the reviewed feature set, push `HEAD` to `main`, and verify remote
   divergence.

## Bug triage rule for future generated changes

For each bug, capture the route, viewport, theme, motion preference, exact user
action, expected result, actual result, console error, and whether it reproduces
after a clean reload. Fix the smallest shared cause, add a regression test at
the domain or component boundary, then rerun the affected route and the full
static gate. A generated animation never gets to hide content, replace a
working control, or introduce a second scroll owner.
