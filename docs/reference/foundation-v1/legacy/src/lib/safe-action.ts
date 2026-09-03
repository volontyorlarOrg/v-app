import { createSafeActionClient } from "next-safe-action";
import { classifyApiError, type ApiErrorCode } from "@/lib/api/errors";
import { requireSession } from "@/lib/auth/session.server";
import type { SessionPayload } from "@/lib/auth/session";

export type ActionErrorCode = ApiErrorCode;

export class ActionFailure extends Error {
  constructor(readonly code: ActionErrorCode) {
    super(code);
    this.name = "ActionFailure";
  }
}

export const actionClient = createSafeActionClient({
  handleServerError(error): ActionErrorCode {
    if (error instanceof ActionFailure) return error.code;

    const classified = classifyApiError(error);

    console.error(
      `[action] ${classified.code}` +
        (classified.status ? ` (${classified.status})` : "") +
        (classified.requestId ? ` [${classified.requestId}]` : ""),
      classified.cause ?? classified.message,
    );

    return classified.code;
  },
});

export const authedActionClient = actionClient.use(async ({ next }) => {
  const session: SessionPayload = await requireSession();
  return next({ ctx: { session } });
});
