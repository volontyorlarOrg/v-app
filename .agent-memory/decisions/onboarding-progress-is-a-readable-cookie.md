# Onboarding progress is a readable, app-only cookie

Decided in September 2026 with the welcome flow (`/welcome`).

The backend has no onboarding endpoint and the product owner asked for the
flow to live on the frontend, in local storage or cookies. Two things were
kept apart:

- **Progress** — which step a new account reached, and whether the flow was
  skipped or finished — is one cookie, `volontyorlar_onboarding`, holding
  `pending:<step>`, `skipped:<step>` or `done`. A cookie rather than
  `localStorage` because Server Components read it: the welcome page resumes
  at the right step and the dashboard decides whether to show "Finish your
  pass" without a client-only flash. It is not `httpOnly` because the browser
  advances it, it has no `domain` because the marketing site has no use for
  it, and it holds no personal data.
- **Answers** — the profile fields — are saved to the backend at every step
  through the existing `updateProfileAction`, never to browser storage. The audience
  includes minors and [[no-essays-in-browser-storage]] already ruled out a
  local mirror of profile text. A reload mid-flow therefore resumes with what
  was saved and nothing invented.

Two consequences worth knowing: a profile step posts the whole profile with
the other fields hidden, because `PUT /profile` replaces the record; and the
3D pass derives its parts from the saved profile, so it never shows a line the
backend does not hold.

**Merged with the profile redesign (2026-09-09).** The flow originally had a
fourth step for the notification and privacy switches. `main` removed every
preferences surface in the meantime, so that step and its batch action were
dropped rather than resurrected; the flow is three steps.
