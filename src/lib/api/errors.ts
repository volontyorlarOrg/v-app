export const API_ERROR_CODES = [
  "unauthenticated",
  "forbidden",
  "notFound",
  "conflict",
  "validation",
  "rateLimited",
  "network",
  "timeout",
  "server",
  "notConfigured",
  "invalidResponse",
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

const INTERNAL_CODES = new Set<ApiErrorCode>([
  "server",
  "invalidResponse",
  "notConfigured",
]);

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;

  readonly fieldErrors: Readonly<Record<string, string>>;

  readonly requestId: string | undefined;

  constructor(
    code: ApiErrorCode,
    options: {
      status?: number;
      message?: string;
      fieldErrors?: Record<string, string>;
      requestId?: string;
      cause?: unknown;
    } = {},
  ) {
    super(options.message ?? code, { cause: options.cause });
    this.name = "ApiError";
    this.code = code;
    this.status = options.status ?? 0;
    this.fieldErrors = Object.freeze({ ...options.fieldErrors });
    this.requestId = options.requestId;
  }

  get isUserFacing(): boolean {
    return !INTERNAL_CODES.has(this.code);
  }

  get isRetryable(): boolean {
    return (
      this.code === "network" ||
      this.code === "timeout" ||
      this.code === "server" ||
      this.code === "rateLimited"
    );
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function codeForStatus(status: number): ApiErrorCode {
  if (status === 401) return "unauthenticated";
  if (status === 403) return "forbidden";
  if (status === 404) return "notFound";
  if (status === 409) return "conflict";
  if (status === 422 || status === 400) return "validation";
  if (status === 429) return "rateLimited";
  return "server";
}

export function classifyApiError(error: unknown): ApiError {
  if (isApiError(error)) return error;

  if (error instanceof DOMException && error.name === "TimeoutError") {
    return new ApiError("timeout", { cause: error });
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return new ApiError("network", { cause: error });
  }

  if (error instanceof TypeError) {
    return new ApiError("network", { cause: error });
  }

  return new ApiError("server", { cause: error });
}

export function errorMessageKey(error: unknown): ApiErrorCode {
  return isApiError(error) ? error.code : "server";
}
