/**
 * The one error vocabulary for backend failures.
 *
 * The handoff's rule is "do not collapse every failure into 'Something went
 * wrong'". That is only achievable if every layer above the transport agrees
 * on a small, closed set of failure kinds — so this module owns that set, and
 * `classifyApiError` is the single place a raw failure becomes one of them.
 *
 * These codes are also i18n keys under `errors.*`, which is why they are
 * stable strings rather than an enum of numbers: a backend English sentence is
 * never shown to a user, a translated message for the code is.
 */
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

/**
 * Codes that must never reach a user as an explanatory sentence, because the
 * detail is about our infrastructure rather than their action.
 */
const INTERNAL_CODES = new Set<ApiErrorCode>([
  "server",
  "invalidResponse",
  "notConfigured",
]);

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  /** Field-level messages when `code === "validation"`, keyed by field path. */
  readonly fieldErrors: Readonly<Record<string, string>>;
  /** Correlation id echoed to logs; never rendered as the whole message. */
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

  /**
   * True when the message may be surfaced verbatim. Everything else is
   * rendered from the translated `errors.<code>` entry instead, so backend
   * internals cannot leak into the UI.
   */
  get isUserFacing(): boolean {
    return !INTERNAL_CODES.has(this.code);
  }

  /** Retrying the same request could plausibly succeed. */
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

/** Maps an HTTP status onto the closed code set. */
export function codeForStatus(status: number): ApiErrorCode {
  if (status === 401) return "unauthenticated";
  if (status === 403) return "forbidden";
  if (status === 404) return "notFound";
  if (status === 409) return "conflict";
  if (status === 422 || status === 400) return "validation";
  if (status === 429) return "rateLimited";
  return "server";
}

/**
 * Normalises anything thrown inside the request stack — including thrown
 * non-Errors — into an `ApiError`. Call this at every boundary that has to
 * decide what a user sees.
 */
export function classifyApiError(error: unknown): ApiError {
  if (isApiError(error)) return error;

  if (error instanceof DOMException && error.name === "TimeoutError") {
    return new ApiError("timeout", { cause: error });
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return new ApiError("network", { cause: error });
  }

  // `fetch` rejects with a plain TypeError for DNS/TLS/offline failures.
  if (error instanceof TypeError) {
    return new ApiError("network", { cause: error });
  }

  return new ApiError("server", { cause: error });
}

/**
 * The translation key for an error, for use with the `errors` namespace.
 * Unknown input degrades to the generic server entry rather than throwing.
 */
export function errorMessageKey(error: unknown): ApiErrorCode {
  return isApiError(error) ? error.code : "server";
}
