import { isApiError, type FieldErrors } from "@/lib/api/errors";

export type ActionResult =
  | { status: "idle" }
  | { status: "ok" }
  | { status: "error"; code: string; fields: FieldErrors };

export const idleResult: ActionResult = { status: "idle" };
export const okResult: ActionResult = { status: "ok" };

export function failedResult(code: string, fields: FieldErrors = {}): ActionResult {
  return { status: "error", code, fields };
}

export function resultFromError(error: unknown): ActionResult {
  if (isApiError(error)) {
    return failedResult(error.backendCode ?? error.code, error.fieldErrors);
  }
  return failedResult("server");
}
