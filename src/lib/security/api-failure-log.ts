export function apiFailureLog(
  method: string,
  path: string,
  error: { code: string; status?: number; requestId?: string | null },
): string {
  return JSON.stringify({
    event: "api.failure",
    method: method.slice(0, 10),
    path: (path.split("?")[0] ?? "").slice(0, 200),
    code: error.code.slice(0, 100),
    status: error.status,
    requestId: /^[a-f0-9-]{36}$/i.test(error.requestId ?? "")
      ? error.requestId
      : undefined,
  });
}
