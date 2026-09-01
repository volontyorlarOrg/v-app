# `zodResolver` type error when the schema uses `.default()`

**Symptom.**

```
Type 'Resolver<{ bio?: string | undefined; ... }>' is not assignable to
type 'Resolver<{ bio: string; ... }>'
```

**Cause.** `.default()` makes a field optional on the schema's **input** type
and guaranteed on its **output** type. `useForm<T>` with a single generic uses
`T` for both, so one of them is always wrong.

**Fix.** Use the three-generic form:

```ts
useForm<ProfileFormValues, unknown, ProfileInput>({ resolver: zodResolver(profileSchema) })
//      ^ z.input          ^ ctx    ^ z.output
```

`features/profile/schemas.ts` exports both types for exactly this reason. A
`Controller`'s `field.value` is then the *input* type, so an array field can be
`undefined` and needs a `?? []` at the call site.
