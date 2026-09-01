# Source files carry no comments

A project convention, applied across the whole codebase in one pass and enforced
by `npm run check:comments`.

Reasoning lives in `/docs` and `.agent-memory/` instead. The argument is in
[`docs/architecture/CODE_STYLE.md`](../../docs/architecture/CODE_STYLE.md);
the short version is that a comment's audience is whoever opens that file, while
the same paragraph in a document reaches whoever is making the same decision
again — and comments drift silently while documents sit under a heading someone
rereads.

## The stripper is not a regex

`scripts/strip-comments.mjs` uses `ts.getLeadingCommentRanges` and
`ts.getTrailingCommentRanges` over the parsed AST. That matters: a regex over
`//` mangles `https://` inside string literals and JSX text, and a naive
`/\*[\s\S]*?\*/` eats regex literals.

It also parses the result before writing and refuses any file where the
diagnostic count went up.

**A first attempt used `ts.createScanner` with `skipTrivia: false` and silently
found zero comments** — the scanner reached the end of the file and reported no
trivia tokens. The comment-range helpers are the API that actually works for
this.

## What stays

Functional directives only: `eslint-disable`, `@ts-*`, `prettier-*`, shebangs.
The preference is to restructure so even those are unnecessary — the one
`eslint-disable` for `no-location-assign-relative-destination` was removed by
replacing a `window.location.href` assignment with a real anchor, which was
better UX anyway.
