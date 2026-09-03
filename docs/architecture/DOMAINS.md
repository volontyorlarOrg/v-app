# Domains and Hosting

## Implemented

No production hostname is hard-coded anywhere. Both origins are read from
configuration through `src/lib/seo/origin.ts`:

| Helper                                              | Source                      | Behaviour when unset                                        |
| --------------------------------------------------- | --------------------------- | ----------------------------------------------------------- |
| `siteOrigin()` / `siteUrl(path)`                    | `NEXT_PUBLIC_SITE_URL`      | Falls back to `http://localhost:3001`                       |
| `hasVerifiedSiteOrigin()`                           | `NEXT_PUBLIC_SITE_URL`      | `false`; transport-only headers stay off                    |
| `marketingOrigin()` / `marketingHref(locale, page)` | `NEXT_PUBLIC_MARKETING_URL` | `null`; the about, privacy and terms links are not rendered |

Values must be `http(s)` origins; anything else is rejected and treated as
unset. A configured origin is normalised, so a trailing path is discarded.
`marketingHref` builds `/{locale}/privacy` and `/{locale}/terms`, which are the
marketing site's registered legal routes.

The three repositories run side by side locally on fixed ports:

| Repository        | Port | Variable that points at it                                                                          |
| ----------------- | ---- | --------------------------------------------------------------------------------------------------- |
| `../v-web`        | 3000 | `NEXT_PUBLIC_MARKETING_URL` here                                                                    |
| `../v-app` (this) | 3001 | `NEXT_PUBLIC_APP_ORIGIN` in `v-web`; `TELEGRAM_AUTH_COMPLETE_URL` and `CORS_ORIGINS` in `v-backend` |
| `../v-backend`    | 4000 | a server-only API origin, introduced by the plan                                                    |

## Needs verification

| Decision                                                                            | Current evidence |
| ----------------------------------------------------------------------------------- | ---------------- |
| Production origin of the application                                                | None             |
| Public marketing domain                                                             | None             |
| Hosting provider                                                                    | None             |
| Cookie domain and whether the app and the marketing site share a registrable domain | None             |
| Preview deployment policy                                                           | None             |

Do not copy hostnames, project identifiers, or environment values from any
reference repository. Add them only once they are verified externally and
represented in executable configuration.
