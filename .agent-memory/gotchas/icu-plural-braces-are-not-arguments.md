# Don't regex ICU messages for `{arguments}`

A naive check that two locales use the same placeholders:

```ts
[...message.matchAll(/\{(\w+)/g)];
```

reports a false mismatch on every plural message. In

```
{count, plural, one {# event} other {# events}}
```

the inner braces delimit plural **branches**, not arguments — and translations
are free to word those branches however their language needs. English has
`one`/`other`; Russian has `one`/`few`/`other`; Uzbek uses `other` alone. The
argument list is identical (`count`) in all three; the regex sees three
different lists.

**Fix.** `icuArguments()` in `src/i18n/messages.test.ts` tracks brace depth and
reads identifiers only at depth 0.
