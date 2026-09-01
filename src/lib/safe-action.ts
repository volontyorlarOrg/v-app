import { createSafeActionClient } from "next-safe-action";
import { classifyApiError, type ApiErrorCode } from "@/lib/api/errors";
import { requireSession } from "@/lib/auth/session.server";
import type { SessionPayload } from "@/lib/auth/session";

/**
 * The single approved client-triggered mutation boundary.
 *
 * The handoff is explicit that several competing action abstractions must not
 * coexist, so: anything a browser can trigger that changes state goes through
 * one of the clients below. Server Components may call `*.server.ts` request
 * functions directly for reads, but never for writes.
 *
 * The improvement over the Dwelve reference: a failed action returns an
 * **error code**, not an English sentence. Dwelve returns
 * `"Invalid email or password."` from the server, which cannot be shown to a
 * Russian or Uzbek speaker in their language. Here the server returns
 * `"unauthenticated"` and the client renders `t(\`errors.${code}.title\`)`.
 *
 * @see docs/architecture/FORMS.md
 */

/**
 * What every action returns on failure. A member of the closed `ApiErrorCode`
 * set, so the client always has a translation for it.
 */
export type ActionErrorCode = ApiErrorCode;

/**
 * Thrown by action bodies that want a specific code surfaced to the user.
 * Anything else thrown is masked as `server`.
 */
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

    // Server-side only. The message may name internal hosts or config, so it
    // is logged rather than returned; the client receives the bare code.
    console.error(
      `[action] ${classified.code}` +
        (classified.status ? ` (${classified.status})` : "") +
        (classified.requestId ? ` [${classified.requestId}]` : ""),
      classified.cause ?? classified.message,
    );

    return classified.code;
  },
});

/**
 * Actions that require a signed-in user.
 *
 * The session is resolved here and passed down as context. This is what makes
 * "never trust an identity field from a form" enforceable rather than
 * aspirational: an action built on this client cannot read a `userId` from its
 * input, because the only one available is `ctx.session.userId`.
 *
 * The backend still authorises every request independently. This check decides
 * whether it is worth making the call, not whether the user is allowed.
 */
export const authedActionClient = actionClient.use(async ({ next }) => {
  const session: SessionPayload = await requireSession();
  return next({ ctx: { session } });
});
