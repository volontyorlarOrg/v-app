import "server-only";

import type { z } from "zod";
import {
  ApiError,
  classifyApiError,
  codeForStatus,
  type ApiErrorCode,
} from "./errors";
import { privateApiBaseUrl, publicApiBaseUrl } from "./env.server";

/**
 * The only place in this application that talks to the YVC backend.
 *
 * Nothing outside `*.server.ts` modules may import it, and no component may
 * call the API origin directly. The rules it enforces (handoff §12):
 *
 *   1. The origin comes from a server-only environment variable.
 *   2. Credentials are attached here and nowhere else.
 *   3. Timeouts are explicit; a hung backend cannot hang a render forever.
 *   4. A non-JSON or malformed body is a typed failure, not a crash.
 *   5. Every response that the UI depends on is parsed by a Zod schema before
 *      it is handed upwards — backend JSON is untrusted input.
 *   6. Errors leave here as `ApiError` with a code from the closed set.
 *
 * @see docs/architecture/ARCHITECTURE.md
 */

const DEFAULT_TIMEOUT_MS = 12_000;

type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue | readonly string[]>;

export type ApiRequest<TSchema extends z.ZodType | undefined = undefined> = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  query?: QueryParams;
  body?: unknown;
  /** Schema the successful response body must satisfy. */
  schema?: TSchema;
  timeoutMs?: number;
  signal?: AbortSignal;
  /** Bearer credential. Supplied only by `authedApi`, never by a caller. */
  accessToken?: string;
  /**
   * Next.js fetch caching. Defaults to `no-store`: authenticated reads must
   * never be shared between users. Public reads override this deliberately.
   */
  cache?: RequestCache;
  revalidate?: number;
  tags?: readonly string[];
};

function buildUrl(baseUrl: string, path: string, query?: QueryParams): string {
  const url = new URL(
    path.startsWith("/") ? `${baseUrl}${path}` : `${baseUrl}/${path}`,
  );

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      for (const item of value) url.searchParams.append(key, item);
    } else {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

/** Combines a caller's abort signal with our own timeout. */
function requestSignal(
  signal: AbortSignal | undefined,
  timeoutMs: number,
): AbortSignal {
  const timeout = AbortSignal.timeout(timeoutMs);
  return signal ? AbortSignal.any([signal, timeout]) : timeout;
}

async function readBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null;

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    // A proxy error page or an HTML 502 lands here. The body is useless to
    // both the user and the parser, so it is discarded rather than surfaced.
    return null;
  }
}

/**
 * Pulls field-level messages out of an error body.
 *
 * Shapes accepted, because the backend contract is not fixed yet (see
 * docs/api/API_CONTRACT.md): `{ errors: { field: "msg" } }`,
 * `{ errors: { field: ["msg"] } }`, and NestJS's `{ message: ["msg", ...] }`
 * — the last of which has no field names, so it produces none.
 */
function extractFieldErrors(body: unknown): Record<string, string> {
  if (typeof body !== "object" || body === null) return {};

  const errors = (body as { errors?: unknown }).errors;
  if (typeof errors !== "object" || errors === null) return {};

  const result: Record<string, string> = {};
  for (const [field, value] of Object.entries(errors)) {
    if (typeof value === "string") {
      result[field] = value;
    } else if (Array.isArray(value) && typeof value[0] === "string") {
      result[field] = value[0];
    }
  }
  return result;
}

function baseUrlOrThrow(scope: "public" | "private"): string {
  const baseUrl = scope === "public" ? publicApiBaseUrl() : privateApiBaseUrl();

  if (!baseUrl) {
    // Deliberately not a fallback to localhost. A production deployment with a
    // missing origin should fail loudly rather than quietly fetch nothing.
    throw new ApiError("notConfigured", {
      message: "YVC_API_BASE_URL is not set.",
    });
  }

  return baseUrl;
}

type ApiResult<TSchema extends z.ZodType | undefined> = TSchema extends z.ZodType
  ? z.infer<TSchema>
  : unknown;

async function request<TSchema extends z.ZodType | undefined>(
  scope: "public" | "private",
  path: string,
  init: ApiRequest<TSchema> = {},
): Promise<ApiResult<TSchema>> {
  const {
    method = "GET",
    query,
    body,
    schema,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    signal,
    accessToken,
    cache,
    revalidate,
    tags,
  } = init;

  const requestId = crypto.randomUUID();
  const url = buildUrl(baseUrlOrThrow(scope), path, query);

  const headers = new Headers({
    Accept: "application/json",
    "X-Request-Id": requestId,
  });

  if (body !== undefined) headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  let response: Response;

  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: requestSignal(signal, timeoutMs),
      // Authenticated reads default to no-store so one volunteer's data can
      // never be served from another's cached render.
      cache: cache ?? (accessToken ? "no-store" : undefined),
      next:
        revalidate !== undefined || tags
          ? { revalidate, tags: tags ? [...tags] : undefined }
          : undefined,
    });
  } catch (cause) {
    const error = classifyApiError(cause);
    logFailure(method, path, error, requestId);
    throw error;
  }

  const payload = await readBody(response);

  if (!response.ok) {
    const code: ApiErrorCode = codeForStatus(response.status);
    const error = new ApiError(code, {
      status: response.status,
      fieldErrors: code === "validation" ? extractFieldErrors(payload) : undefined,
      requestId,
    });
    logFailure(method, path, error, requestId);
    throw error;
  }

  if (!schema) return payload as ApiResult<TSchema>;

  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    // The backend answered 200 with a body we cannot trust. Treating it as a
    // success would push `undefined` into the UI at a random depth; this
    // fails at the boundary instead, where the cause is still visible.
    const error = new ApiError("invalidResponse", {
      status: response.status,
      message: `Response from ${method} ${path} did not match its schema.`,
      requestId,
      cause: parsed.error,
    });
    logFailure(method, path, error, requestId);
    throw error;
  }

  return parsed.data as ApiResult<TSchema>;
}

/**
 * Server-side logging for a failed request.
 *
 * Logs the code, status, path, and correlation id — never the request body,
 * never a response body. Application answers and profile fields are exactly
 * the kind of content that must not end up in logs (handoff §26).
 */
function logFailure(
  method: string,
  path: string,
  error: ApiError,
  requestId: string,
): void {
  console.error(
    `[api] ${method} ${path} -> ${error.code}` +
      (error.status ? ` (${error.status})` : "") +
      ` [${requestId}]`,
  );
}

/** Unauthenticated read against the public API surface. */
export function publicApi<TSchema extends z.ZodType | undefined = undefined>(
  path: string,
  init?: ApiRequest<TSchema>,
): Promise<ApiResult<TSchema>> {
  return request("public", path, init);
}

/**
 * Authenticated request. The token is supplied by the session layer, never by
 * a caller and never from a form field.
 *
 * @see src/lib/auth/session.server.ts
 */
export function authedApi<TSchema extends z.ZodType | undefined = undefined>(
  path: string,
  accessToken: string,
  init?: Omit<ApiRequest<TSchema>, "accessToken">,
): Promise<ApiResult<TSchema>> {
  return request("private", path, { ...init, accessToken });
}
