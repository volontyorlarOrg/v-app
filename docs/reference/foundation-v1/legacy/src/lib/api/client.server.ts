import "server-only";

import type { z } from "zod";
import { ApiError, classifyApiError, codeForStatus, type ApiErrorCode } from "./errors";
import { privateApiBaseUrl, publicApiBaseUrl } from "./env.server";

const DEFAULT_TIMEOUT_MS = 12_000;

type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue | readonly string[]>;

export type ApiRequest<TSchema extends z.ZodType | undefined = undefined> = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  query?: QueryParams;
  body?: unknown;

  schema?: TSchema;
  timeoutMs?: number;
  signal?: AbortSignal;

  accessToken?: string;

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
    return null;
  }
}

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

export function publicApi<TSchema extends z.ZodType | undefined = undefined>(
  path: string,
  init?: ApiRequest<TSchema>,
): Promise<ApiResult<TSchema>> {
  return request("public", path, init);
}

export function authedApi<TSchema extends z.ZodType | undefined = undefined>(
  path: string,
  accessToken: string,
  init?: Omit<ApiRequest<TSchema>, "accessToken">,
): Promise<ApiResult<TSchema>> {
  return request("private", path, { ...init, accessToken });
}
