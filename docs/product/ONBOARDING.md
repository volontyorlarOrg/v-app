# The Welcome Flow

What happens between a new account and the first application, why each step
exists, and how the flow keeps its state without a backend feature. This is
the research and the direction behind `src/app/[locale]/(onboarding)/welcome/`.

## Who arrives

A student who just created an account: by email on `/signup`, or through
Telegram or Google when the backend reports `isNewUser`. They came to find
volunteering, not to fill in forms. The backend already has an empty profile
for them; nothing about the product is usable until the reusable profile
exists, because every application snapshots it.

The flow gets them to the profile an organiser can evaluate in three short
steps and then points them at the first opportunity. It is not a tour of the
panel: the panel explains itself, and the dashboard's empty states say what
fills them.

## Direction

- **THESIS** — the threshold between the doorway and the room. The flow keeps
  the sign-in pages' dot-grid ground and ends by handing the volunteer into
  the panel. The category default it refuses is the centred wizard card with
  a progress bar on a blank page.
- **OWN-WORLD** — the app's own tokens: serif greeting, sans controls, blue
  for the institution (the lanyard, the band, the current step), orange only
  for what the person did (a finished step, the seal at the end). The one new
  object is the volunteer pass: a low-poly lanyard badge in Three.js that
  gains a part each time a step is saved.
- **STORY** — "fill it in once; every application reuses it." A step saved is
  a line printed on the pass; the last screen stamps it and names the next
  action.
- **FIRST VIEWPORT** — desktop: greeting and lead on the left with the pass
  hanging beneath them and the step rail under that; the step panel on the
  right, the primary action at its foot. Phone: greeting, a compact pass,
  the rail as a strip of three nodes, then the panel.
- **FORM** — a split stage. No concept roll was run and there is no seed
  key: the brief pinned the structure ("this onboarding must go through the
  profile completion phase and at the end there must be reference to call
  user for action"), and the one question round pinned the rest (save each
  step to the real profile; a new procedural object that is not the orbit;
  redirect new sign-ups with both skip controls). Shaped directly, as the
  playbook allows for a precisely specified request.
- **FINISH** — verified in the browser at desktop and phone widths, both
  themes, reduced motion; smoke-tested end to end; recorded here and in
  `DESIGN.md`.

## The steps

| Step            | Saves                                                         | Counts toward completeness |
| --------------- | ------------------------------------------------------------- | -------------------------- |
| Welcome         | Nothing                                                       |                            |
| About you       | `fullName`, `bio` through `updateProfileAction`               | name, bio                  |
| Where you study | `school`, `region`, `languages` through `updateProfileAction` | school, region, languages  |
| Contact         | `phone`, `telegram` through `updateProfileAction`             | neither, by design         |
| Ready           | The leaderboard handle, if the account may rename it          |                            |

Every profile step posts the whole profile: the fields the step does not show
travel as hidden inputs, because `PUT /profile` replaces the record. A step
that fails validation stays on screen with the field named; the pass only
gains a part once the backend has accepted the save, so the object never
claims more than the profile holds.

The Ready step shows completeness, what happens next, and the call to action.
It also carries the shared rename form from `src/components/account/`. This is
the fourth step's only write and goes to `PUT /me/username` rather than to the
profile. A generated username blocks the exit actions until the volunteer saves
an available platform username. The volunteer layout repeats that gate for
existing generated accounts on their next visit. Telegram-provided usernames
do not block entry and remain editable. →
[`LEADERBOARD.md`](LEADERBOARD.md)

Contact is asked for even though it stopped counting toward completeness when
the profile redesign landed, because an organiser who cannot reach a
volunteer cannot accept one. The fields the flow leaves to the profile page
are `gradeYear`, `city` and `links`. The name is the one field
that cannot be skipped while it is empty, because the backend refuses a
profile without it.

## Skipping

- **Skip for now** sits on the welcome screen and in the header of every
  step. For an account that already has a public username it records the current
  step and leaves. For a generated account it jumps to the Ready step so the
  required username can be chosen without forcing profile completion.
- **Skip this step** advances without saving.
- **Back** returns one step; the welcome screen is reachable from the first.
- The dashboard shows a "Finish your pass" row while the flow is open, with
  the number of steps done, a link back to it, and "Not now", which closes it
  for good. Reaching the last screen closes it too.
- `/welcome` can always be reopened; a closed flow replays from the welcome.

## Where the state lives

The backend has no onboarding endpoint and does not need one. Progress lives
in one readable, app-only cookie, `volontyorlar_onboarding`, holding a status
and a step name and nothing else: `pending:about`, `skipped:contact`, or
`done`. It is written by the sign-up Server Action and the two OAuth
callbacks when an account is new, advanced by the browser as steps change,
read by the welcome page to resume and by the dashboard to decide whether to
show the row. It carries no personal data, is not `httpOnly` because the
browser updates it, is scoped to this origin only, and expires after ninety
days. The profile answers themselves never touch browser storage: they are
saved to the backend at each step, as
[`../../.agent-memory/decisions/no-essays-in-browser-storage.md`](../../.agent-memory/decisions/no-essays-in-browser-storage.md)
requires.

The domain rules are in `src/lib/onboarding/`: `steps.ts` (the order, which
fields each step owns, and which pass parts saved data earns) and `state.ts`
(the cookie's grammar and the resume rule), each with its tests.

## The pass

`PassStage` renders a lanyard badge with Three.js: two straps, a clip, a card
with the brand band and the logo's glyph (the "on" and its heart, extruded
from the kit's own paths), an avatar tile, and five parts that appear as
they are earned: the printed name lines, the place row, three language
chips, the contact row, and the orange seal at the end. Parts are derived from the saved profile, so a
returning volunteer sees what is already there. A saved step nudges the
badge on its lanyard; the seal stamps down and swings it.

The scene loads `three` lazily, renders at a capped pixel ratio with the
low-power preference, pauses when offscreen or when the tab is hidden, reads
its colours from the CSS tokens and follows the theme, and disposes
everything on unmount. Reduced motion keeps the object but removes the swing,
the parallax and the part animations. Without WebGL or JavaScript an inline
SVG of the same badge, with the same parts, is what the page shows.

## What was dropped, and why

The flow was built with a fourth step, "What we may send you", holding the
notification and privacy switches. It was removed when this branch merged
`main`, because `main` had removed every preferences surface from the
application: `/me/preferences` is no longer read or written, and the read,
the Server Action, the types, the schema and the switch component were all
deleted. A step whose backing was deliberately deleted does not come back
through onboarding. If that decision is reversed, the step is a rail entry,
three strings, a switches component and a batch action away.

## Open decisions

- Whether the Telegram sign-in should ask for a display name when Telegram
  provides none, so the first step is never empty.
- Whether a `next` return path should skip the flow entirely for an account
  created from an opportunity page.
