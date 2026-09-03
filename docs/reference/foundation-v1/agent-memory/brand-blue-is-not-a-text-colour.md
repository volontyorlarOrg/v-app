# `blue` is a graphics colour; `blue-deep` is the button

The single most load-bearing consequence of the logo specification, and the
easiest one to undo by accident.

`#007FC2` is **4.36:1** on white. That clears WCAG's 3:1 threshold for graphics
and large text, and misses the 4.5:1 floor for body text. So:

- the mark, icons, and headings at 24px+ may use `blue`
- body text, small labels, and **any white-on-blue button** use `blue-deep`
  (`#005E92`, 6.96:1)

The trap: a primary button filled with brand blue and labelled in white looks
completely normal and fails AA. Every design system that adopts a mid-tone brand
blue walks into it.

The same applies to orange: `#E85D30` is 3.48:1, `#B34917` is 5.41:1.

`scripts/check-contrast.mjs` asserts both directions — that `blue-deep` passes
4.5:1 **and** that white-on-`blue` does not. The second assertion is the one
that matters: it fails if someone "simplifies" the palette by dropping the deep
variants.

See [[why-danger-is-not-orange]].
