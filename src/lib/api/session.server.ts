import "server-only";

import { redirect } from "next/navigation";
import type { z } from "zod";

import { api, type ApiRequest } from "@/lib/api/client.server";
import { isApiError, isSessionOver } from "@/lib/api/errors";
import { type SessionPayload } from "@/lib/auth/session";
import { getSession } from "@/lib/auth/session.server";

export const SESSION_EXPIRED_PATH = "/api/auth/session/expired";

function endSession(): never {
  redirect(SESSION_EXPIRED_PATH);
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) endSession();
  return session as SessionPayload;
}

type AuthedRequest<TSchema extends z.ZodType | undefined> = Omit<
  ApiRequest<TSchema>,
  "accessToken" | "cache"
>;

type AuthedResult<TSchema extends z.ZodType | undefined> = TSchema extends z.ZodType
  ? z.infer<TSchema>
  : unknown;

export async function authed<TSchema extends z.ZodType | undefined = undefined>(
  path: string,
  init: AuthedRequest<TSchema> = {},
): Promise<AuthedResult<TSchema>> {
  const session = await requireSession();

  try {
    return (await api(path, {
      ...init,
      accessToken: session.accessToken,
      cache: "no-store",
    })) as AuthedResult<TSchema>;
  } catch (error) {
    if (!isSessionOver(error)) throw error;

    return endSession();
  }
}

export function isMissing(error: unknown): boolean {
  return isApiError(error) && (error.code === "notFound" || error.code === "validation");
}
