# The identity card is the profile's link

**Date:** 2026-09-18

## Decision

The sidebar's foot used to show the identity card (avatar, name, handle,
level) as static text with a separate "Profile" row under it. The two are now
one element: the card is the link to `/profile`, and the "Profile" row is gone.
Settings and sign out stay beneath it as before.

The registry says so with `IDENTITY_ROUTE = "profile"` and `navGroup: null` on
the profile route, so no sidebar stack can list the profile a second time. The
phone's account menu follows the same rule: its name block is the profile
link, and its list holds only settings above sign out. The tab bar still has
its profile thumb.

## Why

The user asked for the card and the row to merge, with the card's look
winning. Two entries for one destination read as two places.

## Consequences

- The card is `SidebarIdentity`, a client component because it reads the
  pathname: it takes `aria-current="page"` on `/profile` and `/profile/edit`,
  shown as a `shell-muted` outline on a fully raised fill. The sidebar's pale
  active pill was not reused, because the card's avatar disc is the same pale
  blue and would vanish into it, and the orange level would sit on blue.
- Its accessible name is "Profile: <name>" (`nav.profile` plus the name), so
  the name a volunteer sees is inside the name a screen reader or voice
  control uses. The smoke tests find it by that name.
- The sidebar card carries no chevron. One was tried and cost 24px, which
  truncated the handle and would truncate a name as long as "Abdulaziz
  Yusupaliev"; the card keeps its exact old layout, and hover (a half-strength
  `shell-muted` edge on the full raised fill) and the focus ring say it is a
  link. The phone menu's name block does keep a chevron: it has the width, and
  a touch screen has no hover to say the block can be tapped.
- A later polish kept that layout and changed only states: the avatar's orange
  ring is an outline with a 2px gap, so orange never touches the pale-blue
  disc, and turns full strength on hover and on the current page; a 1px
  `shell-ink` top highlight lifts the card the way dark panels are lifted; a
  pressed state; and the sidebar's focus ring is `shell-ink`, because the
  global `primary-ink` ring is dark blue by day and nearly vanished on navy.
