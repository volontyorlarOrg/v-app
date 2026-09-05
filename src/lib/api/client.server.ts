import "server-only";

import type { z } from "zod";

import { apiBaseUrl } from "@/lib/auth/config";
import { ApiError, classifyApiError, codeForStatus } from "@/lib/api/errors";

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

type ApiResult<TSchema extends z.ZodType | undefined> = TSchema extends z.ZodType
  ? z.infer<TSchema>
  : unknown;

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

function logFailure(method: string, path: string, error: ApiError, requestId: string) {
  console.error(
    `[api] ${method} ${path} -> ${error.code}` +
      (error.status ? ` (${error.status})` : "") +
      ` [${requestId}]`,
  );
}

export async function api<TSchema extends z.ZodType | undefined = undefined>(
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

  const baseUrl = apiBaseUrl();

  if (!baseUrl) {
    throw new ApiError("notConfigured", {
      message: "VOLONTYORLAR_API_URL is not set.",
    });
  }

  const requestId = crypto.randomUUID();
  const url = buildUrl(baseUrl, path, query);

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
    const error = new ApiError(codeForStatus(response.status), {
      status: response.status,
      requestId,
      details: payload,
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

export function authedApi<TSchema extends z.ZodType | undefined = undefined>(
  path: string,
  accessToken: string,
  init?: Omit<ApiRequest<TSchema>, "accessToken">,
): Promise<ApiResult<TSchema>> {
  return api(path, { ...init, accessToken });
}
