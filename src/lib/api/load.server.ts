import "server-only";

import {
  isApiError,
  isTransient,
  type ApiError,
  type ApiErrorCode,
} from "@/lib/api/errors";

export type LoadFailure = {
  code: ApiErrorCode;
  reason: "unreachable" | "failed";
  retryable: boolean;
  reference: string | null;
};

export type Loaded<T> =
  { status: "loaded"; data: T } | { status: "failed"; failure: LoadFailure };

export function failureOf(error: ApiError): LoadFailure {
  return {
    code: error.code,
    reason: isTransient(error) ? "unreachable" : "failed",
    retryable: error.isRetryable,
    reference: error.requestId ? error.requestId.slice(0, 8) : null,
  };
}

export function unknownFailure(): LoadFailure {
  return { code: "server", reason: "failed", retryable: true, reference: null };
}

export async function settle<T>(load: () => Promise<T>): Promise<Loaded<T>> {
  try {
    return { status: "loaded", data: await load() };
  } catch (error) {
    if (!isApiError(error)) throw error;
    return { status: "failed", failure: failureOf(error) };
  }
}

export function dataOf<T>(loaded: Loaded<T>): T | null {
  return loaded.status === "loaded" ? loaded.data : null;
}
