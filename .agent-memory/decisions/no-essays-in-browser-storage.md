# Essay drafts are never written to localStorage

The obvious way to satisfy "never lose long answers on accidental refresh" is a
`localStorage` mirror of the editor. It was rejected.

**Why.** Essays are the most sensitive content a volunteer produces, the
audience includes minors, and the privacy rules forbid sensitive data in
browser storage without a documented need. `localStorage` persists after
sign-out, survives on shared and family devices, and is readable by any script
that gets injected.

**What covers the requirement instead.**

1. **Server-side draft autosave** after 1.5s idle. This is strictly better than
   a local mirror: it also survives the tab dying, and it follows the volunteer
   to another device.
2. **`beforeunload`** for the window between a keystroke and the next
   successful save — so a loss is never silent.
3. **An honest indicator.** "Not saved" with `role="alert"` on failure. The UI
   never claims "Saved" when it is not.

**If this is ever revisited,** the thing to change is the failure path — a
local buffer used _only_ when the server save fails, cleared on success, and
documented. Not a permanent mirror.

See [[error-codes-not-messages]] for the related "never show a backend
sentence" rule.
